import Widget from "../components/molecules/admin-card";
import Chart from "../components/molecules/user-vs-freq-chart";
import { useCallback, useEffect, useState } from "react";
import { AdminService, type UserFamilies } from "../services/admin.service";
import type OverviewStats from "../models/overview-stats";
import Card from "../components/atoms/card";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

type OverviewStatsWithUsersMock = OverviewStats;

export default function AdminDashboard() {
  const [overviewStats, setOverviewStats] = useState<null | OverviewStatsWithUsersMock>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserFamilies[]>([]);

  const overviewStatsCallback = useCallback(async () => {
    const overviewStatsResponse = await AdminService.getOverviewStats();
    {/* New fetches */}

    setOverviewStats(overviewStatsResponse);
    // setFilteredUsers(users);
  }, []);

  useEffect(() => {
    overviewStatsCallback();
  }, [overviewStatsCallback]);

  if (!overviewStats) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <section className="p-4 lg:px-20 container mx-auto w-full">
        <div className="w-full flex flex-col lg:flex-row  gap-8">
          <Widget type="user" amount={overviewStats.totalUsers} />
          <Widget type="family" amount={overviewStats.totalFamilies} />
          <Widget type="admin" amount={overviewStats.totalAdmins} />
          <Widget
            type="frequency"
            amount={overviewStats.totalFrequency.total}
            diff={0}
          />
        </div>
        <div className="w-full flex flex-col lg:flex-row gap-8 mt-8">
          <div className="w-full text-red-500">
            <Chart title="Weekly new users" timeInterval="week" id="weekly" aspect={4 / 3} />
          </div>
          <div className="w-full text-yellow-500">
            <Chart title="Monthly new users" timeInterval="month" id="monthly" aspect={4 / 3} />
          </div>
          <div className="w-full text-green-500">
            <Chart title="Frequency per month" timeInterval="month" id="frequency" aspect={4 / 3} />
          </div>
        </div>


        <Card className="bg-white rounded-lg p-4 mt-8 flex-col border-t border-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="w-full text-2xl text-gray-500 mb-2.5 flex items-center justify-between ">User Overview</h2>
            <div className="text-sm text-gray-500">
              <p>Total Users: {overviewStats.totalUsers}</p>
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => {
                    const term = e.target.value;
                    setSearchTerm(term);
                    if (users) {
                      const filtered = users.filter((user) =>
                        user.name.toLowerCase().includes(term.toLowerCase())
                      );
                      setFilteredUsers(filtered);
                    }
                  }}
                />
              </div>
            </div>

          </div>
          
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User Name</TableCell>
                <TableCell>Families</TableCell>
                <TableCell>Family Members</TableCell>
                <TableCell>Account Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>
                    {user.families.map((family) => (
                      <div key={family._id}>
                        {family.name} (Created At: {new Date(family.createdAt).toLocaleDateString()})
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>
                    
                    {user.families.map((family) => (
                      <div key={family._id}>
                        Members in {family.name}: {family.memberCount}
                      </div>
                    ))}

                  </TableCell>
                  <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

        </Card>
      </section>
    </>
  );
}
