import { JsonRepository } from "./json-repository.js";
/**
 * Single shared repository instances — imported by services across modules.
 * Each wraps one JSON file under `DATA_DIR`.
 */
export const usersRepository = new JsonRepository("users.json");
export const rolesRepository = new JsonRepository("roles.json");
export const permissionsRepository = new JsonRepository("permissions.json");
export const sessionsRepository = new JsonRepository("sessions.json");
//# sourceMappingURL=repositories.js.map