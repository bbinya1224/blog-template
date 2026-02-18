import {
  createWhitelistGetHandler,
  createWhitelistPostHandler,
  createWhitelistPutHandler,
  createWhitelistDeleteHandler,
} from '@/features/admin/api/createWhitelistHandler';
import {
  getAllUsers,
  getUserByEmail,
  addUser,
  updateUser,
  deleteUser,
} from '@/features/admin/api/whitelistRepository';

const deps = {
  getAllUsers,
  getUserByEmail,
  addUser,
  updateUser,
  deleteUser,
};

export const GET = createWhitelistGetHandler(deps);
export const POST = createWhitelistPostHandler(deps);
export const PUT = createWhitelistPutHandler(deps);
export const DELETE = createWhitelistDeleteHandler(deps);
