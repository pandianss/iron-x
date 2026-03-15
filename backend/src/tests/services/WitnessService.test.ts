import 'reflect-metadata';
import { container } from 'tsyringe';
import { WitnessService } from '../../services/witness.service';
import { EmailService } from '../../modules/communication/email.service';

const mockPrisma = {
  action:          { findUnique: jest.fn(), update: jest.fn() },
  user:            { findUnique: jest.fn() },
  actionInstance:  { findUnique: jest.fn() },
  witnessNotification: { create: jest.fn() },
};

const mockEmailService = {
  sendEmail: jest.fn().mockResolvedValue(undefined),
};

beforeAll(() => {
  container.registerInstance('PrismaClient', mockPrisma as any);
  container.registerInstance(EmailService, mockEmailService as any);
});

beforeEach(() => {
  jest.clearAllMocks();
});

const TEAM_ID = 'team-shared';

const actionWithUser = (userTeams: string[]) => ({
  action_id: 'action-1',
  title: 'Morning Run',
  user: {
    user_id: 'user-1',
    email: 'owner@test.com',
    team_memberships: userTeams.map(t => ({ team_id: t })),
  },
});

const witnessUser = (witnessTeams: string[]) => ({
  user_id: 'witness-1',
  email: 'witness@test.com',
  team_memberships: witnessTeams.map(t => ({ team_id: t })),
});

describe('WitnessService', () => {
  let service: WitnessService;

  beforeEach(() => {
    service = container.resolve(WitnessService);
  });

  // --- assignWitness: team guard ---
  it('assigns witness when both users share a team', async () => {
    mockPrisma.action.findUnique.mockResolvedValue(actionWithUser([TEAM_ID, 'team-other']));
    mockPrisma.user.findUnique.mockResolvedValue(witnessUser([TEAM_ID]));
    mockPrisma.action.update.mockResolvedValue({});

    await expect(service.assignWitness('action-1', 'witness-1')).resolves.not.toThrow();
    expect(mockPrisma.action.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ witness_user_id: 'witness-1' }),
      })
    );
  });

  it('throws when witness shares no team with the action owner', async () => {
    mockPrisma.action.findUnique.mockResolvedValue(actionWithUser(['team-A']));
    mockPrisma.user.findUnique.mockResolvedValue(witnessUser(['team-B']));

    await expect(service.assignWitness('action-1', 'witness-1'))
      .rejects.toThrow('Witness must be a team member');
    expect(mockPrisma.action.update).not.toHaveBeenCalled();
  });

  it('throws when action is not found', async () => {
    mockPrisma.action.findUnique.mockResolvedValue(null);

    await expect(service.assignWitness('bad-action', 'witness-1'))
      .rejects.toThrow('Action or User not found');
  });

  it('throws when witness user is not found', async () => {
    mockPrisma.action.findUnique.mockResolvedValue(actionWithUser([TEAM_ID]));
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(service.assignWitness('action-1', 'ghost-witness'))
      .rejects.toThrow('Witness not found');
  });

  // --- handleActionMissed: email notification ---
  it('sends email to witness when an action is missed', async () => {
    const instance = {
      instance_id: 'inst-1',
      action: {
        title: 'Morning Run',
        witness: { user_id: 'witness-1', email: 'witness@test.com' },
        user:    { user_id: 'user-1',    email: 'owner@test.com'   },
      },
    };
    mockPrisma.actionInstance.findUnique.mockResolvedValue(instance);
    mockPrisma.witnessNotification.create.mockResolvedValue({});

    await service.handleActionMissed('inst-1');

    expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
      'witness@test.com',
      expect.stringContaining('Witness Alert'),
      expect.stringContaining('Morning Run')
    );
  });

  it('does not send email when action has no witness assigned', async () => {
    const instance = {
      instance_id: 'inst-1',
      action: {
        title: 'Solo Habit',
        witness: null,
        user: { user_id: 'user-1', email: 'owner@test.com' },
      },
    };
    mockPrisma.actionInstance.findUnique.mockResolvedValue(instance);

    await service.handleActionMissed('inst-1');
    expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
  });
});
