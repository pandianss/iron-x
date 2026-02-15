
# Iron-X Compliance Mapping Framework

Iron-X includes a built-in compliance mapping engine to assist with **SOC 2 Type II** and **ISO 27001** audits.

## Supported Frameworks

### SOC 2 (Security, Availability, Confidentiality)
| Control Code | Description | Iron-X Mechanism | Evidence Source |
| :--- | :--- | :--- | :--- |
| **CC6.1** | Logical Access Security | RBAC & JWT Enforced API | `DB_TABLE:users,roles` |
| **CC6.7** | Transmission Security | TLS 1.2+ Encryption | `INFRA:load_balancer` |
| **CC2.1** | Security Commitments | Public Security Policy | `DOC:security_policy` |
| **A.1.2** | Access Modification | Subscription Tier Enforcement | `DB_TABLE:subscriptions` |

### ISO 27001
| Control Code | Description | Iron-X Mechanism | Evidence Source |
| :--- | :--- | :--- | :--- |
| **A.9.2.1** | User Registration | Centralized Auth Flow | `API:POST /auth/register` |
| **A.12.4.1** | Event Logging | Immutable Audit Logs | `DB_TABLE:audit_logs` |

## Generating Reports

Iron-X exposes an API to generate real-time readiness reports.

### JSON Report
**Endpoint:** `GET /api/v1/compliance/report/:framework`
**Example:** `GET /api/v1/compliance/report/SOC%202`
**Response:**
```json
{
  "framework": "SOC 2",
  "generated_at": "2026-02-15T03:42:30.000Z",
  "total_controls": 4,
  "controls": [...]
}
```

### Evidence Pack Export
**Endpoint:** `GET /api/v1/compliance/export/:framework`
**Example:** `GET /api/v1/compliance/export/ISO%2027001`
**Response:** Text/Log dump of verifiable evidence.
