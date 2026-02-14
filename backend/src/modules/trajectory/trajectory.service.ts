import { trajectoryClassification } from './trajectory.classification';
import { trajectoryProjection } from './trajectory.projection';
import { trajectoryReporter } from './trajectory.reporter';

export const TrajectoryService = {
    ...trajectoryClassification,
    ...trajectoryProjection,
    ...trajectoryReporter
};

export type { DisciplineClassification } from './trajectory.classification';
