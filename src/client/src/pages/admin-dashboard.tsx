import Widget from "../components/molecules/admin-card";
import Chart from "../components/molecules/user-vs-freq-chart";
import { useCallback, useEffect, useState } from "react";
import {
  AdminService,
  type UserFamilies,
  type ChartDataPoint,
} from "../services/admin.service";
import type OverviewStats from "../models/overview-stats";
import Card from "../components/atoms/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { createOutline } from "ionicons/icons";
import Button from "@mui/material/Button";
import { IonIcon } from "@ionic/react";
import { personAdd, ban, checkmarkCircle } from "ionicons/icons";
import CreateUserModal from "../components/organisms/createUserModal";
import DisableUserModal from "../components/organisms/disableUserModal";
import EditUserModal from "../components/organisms/editUserModal";

interface UserForModal {
  _id: string;
  name: string;
  email: string;
  deletedAt?: string | null;
  birthDate?: string;
  color?: string;
  phoneNumber?: string;
  role?: "parent" | "child" | "relative";
  isAdmin?: boolean;
}

export default function AdminDashboard() {
  const [overviewStats, setOverviewStats] = useState<null | OverviewStats>(
    null
  );
  const [usersWithFamilies, setUsersWithFamilies] = useState<UserFamilies[]>(
    []
  );
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<ChartDataPoint[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<ChartDataPoint[]>([]);
  const [frequencyStats, setFrequencyStats] = useState<ChartDataPoint[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [userToDisable, setUserToDisable] = useState<UserForModal | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserForModal | null>(null);
  const [userToEdit, setUserToEdit] = useState<UserForModal | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [overview, users, weekly, monthly, frequency, allUsersList] =
        await Promise.all([
          AdminService.getOverviewStats(),
          AdminService.getUsersWithFamilies(),
          AdminService.getNewUsersStats("week"),
          AdminService.getNewUsersStats("month"),
          AdminService.getFrequencyStats(),
          AdminService.getAllUsers(),
        ]);

      setOverviewStats(overview);
      setUsersWithFamilies(users);
      setAllUsers(allUsersList);
      setFilteredUsers(allUsersList);
      setWeeklyStats(weekly);
      setMonthlyStats(monthly);
      setFrequencyStats(frequency);
      console.log("All users:", allUsersList);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!allUsers || allUsers.length === 0) return;

    const filtered = allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(term.toLowerCase()) ||
        user.email.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  if (isLoading || !overviewStats) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <section className="mx-auto w-full min-h-screen pb-20 max-w-6xl p-4 lg:p-0">
        <h1 className="text-lg md:text-2xl font-bold mb-8">Admin Dashboard</h1>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Widget type="user" amount={overviewStats.totalUsers} />
          <Widget type="family" amount={overviewStats.totalFamilies} />
          <Widget type="admin" amount={overviewStats.totalAdmins} />
          <Widget
            type="frequency"
            amount={overviewStats.totalFrequency.total}
            diff={0}
          />
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="w-full h-full">
            <Chart
              title="Weekly New Users"
              id="weekly"
              aspect={4 / 3}
              data={weeklyStats}
              color="#ef4444"
            />
          </div>
          <div className="w-full h-full">
            <Chart
              title="Monthly New Users"
              id="monthly"
              aspect={4 / 3}
              data={monthlyStats}
              color="#f97316"
            />
          </div>
          <div className="w-full h-full">
            <Chart
              title="Connection Frequency"
              id="frequency"
              aspect={4 / 3}
              data={frequencyStats}
              color="#8b5cf6"
            />
          </div>
        </div>

        <Card className="bg-white rounded-xl shadow-md p-6 mt-8 flex-col border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-700">
                User Overview
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Total Users: {overviewStats.totalUsers}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full md:w-80 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<IonIcon icon={personAdd} />}
                onClick={() => setShowCreateUserModal(true)}
                sx={{ whiteSpace: "nowrap" }}
              >
                Create User
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className="font-bold text-gray-600">
                    User Name
                  </TableCell>
                  <TableCell className="font-bold text-gray-600">
                    Email
                  </TableCell>
                  <TableCell className="font-bold text-gray-600">
                    Families
                  </TableCell>
                  <TableCell className="font-bold text-gray-600">
                    Family Members
                  </TableCell>
                  <TableCell className="font-bold text-gray-600">
                    Role
                  </TableCell>
                  <TableCell className="font-bold text-gray-600">
                    Status
                  </TableCell>
                  <TableCell className="font-bold text-gray-600">
                    Joined Date
                  </TableCell>
                  <TableCell className="font-bold text-gray-600">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user._id}
                      hover
                      className={`transition-colors ${
                        user.deletedAt ? "opacity-60 bg-gray-50" : ""
                      }`}
                    >
                      <TableCell className="font-medium text-gray-800">
                        {user.name}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {user.families && user.families.length > 0 ? (
                          <ul>
                            {user.families.map((family: any) => (
                              <li key={family._id}>{family.name}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400">No Families</p>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {user.families && user.families.length > 0
                          ? user.families.reduce(
                              (total: number, family: any) =>
                                total +
                                (family.children ? family.children.length : 0) +
                                (family.members ? family.members.length : 0),
                              0
                            )
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {user.isAdmin ? (
                          <span className="inline-flex items-center px-2 py-1 rounded bg-purple-50 text-purple-700 text-xs w-fit font-semibold">
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded bg-gray-50 text-gray-700 text-xs w-fit">
                            User
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.deletedAt ? (
                          <span className="inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-700 text-xs w-fit font-semibold">
                            Disabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-700 text-xs w-fit font-semibold">
                            Active
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Tooltip
                          title={
                            user.deletedAt ? "Enable User" : "Disable User"
                          }
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              setUserToDisable({
                                _id: user._id,
                                name: user.name,
                                email: user.email,
                                deletedAt: user.deletedAt,
                              })
                            }
                            color={user.deletedAt ? "success" : "error"}
                          >
                            <IonIcon
                              icon={user.deletedAt ? checkmarkCircle : ban}
                            />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={"Edit User"}>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setUserToEdit({
                                _id: user._id,
                                name: user.name,
                                email: user.email,
                                birthDate: user.birthDate,
                                deletedAt: user.deletedAt,
                                color: user.color,
                                phoneNumber: user.phoneNumber,
                                role: user.role,
                                isAdmin: user.isAdmin,
                              })
                            }
                            color="primary"
                          >
                            <IonIcon
                              icon={createOutline}
                              className="text-lg sm:text-xl"
                            />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      className="py-8 text-gray-500"
                    >
                      No users found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>

      <CreateUserModal
        open={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onUserCreated={fetchData}
      />

      <DisableUserModal
        open={!!userToDisable}
        user={userToDisable}
        onClose={() => setUserToDisable(null)}
        onUserUpdated={fetchData}
      />

      <EditUserModal
        open={!!userToEdit}
        user={userToEdit}
        onClose={() => setUserToEdit(null)}
        onUserUpdated={fetchData}
      />
    </>
  );
}
