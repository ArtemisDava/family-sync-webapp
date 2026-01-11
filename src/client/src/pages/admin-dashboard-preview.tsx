import Widget from "../components/molecules/admin-card";
import Chart from "../components/molecules/user-vs-freq-chart";
import { useCallback, useEffect, useState } from "react";
import { AdminService } from "../services/admin.service";
import type OverviewStats from "../models/overview-stats";
import Card from "../components/atoms/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

type OverviewStatsWithUsersMock = OverviewStats & {
  users: {
    _id: string;
    name: string;
    families: {
      _id: string;
      name: string;
      memberCount: number;
      createdAt: string;
    }[];
    countOfChildren: number;
    createdAt: Date;
  }[];
};

export default function AdminDashboardPreview() {
  const [overviewStats, setOverviewStats] =
    useState<null | OverviewStatsWithUsersMock>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<
    OverviewStatsWithUsersMock["users"]
  >(overviewStats ? overviewStats.users : []);

  const overviewStatsCallback = useCallback(async () => {
    const overviewStatsResponse = await AdminService.getOverviewStats();
    overviewStatsResponse.users = [
      {
        _id: "1",
        name: "Jerry Smith",
        families: [
          {
            _id: "f1",
            name: "Smith Family",
            memberCount: 4,
            createdAt: "2023-01-15",
          },
          {
            _id: "f2",
            name: "Johnson Family",
            memberCount: 3,
            createdAt: "2023-03-22",
          },
        ],
        countOfChildren: 5,
        createdAt: new Date("2023-01-15"),
      },
      {
        _id: "2",
        name: "Bob Williams",
        families: [
          {
            _id: "f3",
            name: "Williams Family",
            memberCount: 5,
            createdAt: "2023-02-10",
          },
          {
            _id: "f9",
            name: "Davis Family",
            memberCount: 3,
            createdAt: "2023-03-15",
          },
        ],
        countOfChildren: 2,
        createdAt: new Date("2023-02-10"),
      },
      {
        _id: "3",
        name: "Carol Brown",
        families: [
          {
            _id: "f4",
            name: "Brown Family",
            memberCount: 6,
            createdAt: "2023-04-05",
          },
        ],
        countOfChildren: 4,
        createdAt: new Date("2023-04-05"),
      },
      {
        _id: "4",
        name: "David Jones",
        families: [
          {
            _id: "f5",
            name: "Jones Family",
            memberCount: 2,
            createdAt: "2023-05-12",
          },
        ],
        countOfChildren: 1,
        createdAt: new Date("2023-05-12"),
      },
      {
        _id: "5",
        name: "Eve Garcia",
        families: [
          {
            _id: "f6",
            name: "Garcia Family",
            memberCount: 4,
            createdAt: "2023-06-18",
          },
          {
            _id: "f8",
            name: "Miller Family",
            memberCount: 5,
            createdAt: "2023-07-20",
          },
        ],
        countOfChildren: 3,
        createdAt: new Date("2023-06-18"),
      },
      {
        _id: "6",
        name: "Alice Miller",
        families: [
          {
            _id: "f7",
            name: "Miller Family",
            memberCount: 5,
            createdAt: "2023-07-20",
          },
        ],
        countOfChildren: 2,
        createdAt: new Date("2023-07-20"),
      },
    ];
    setOverviewStats(overviewStatsResponse);
    setFilteredUsers(overviewStatsResponse.users);
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
          <Widget type="frequency" amount={25} diff={0} />
        </div>
        <div className="w-full flex flex-col lg:flex-row gap-8 mt-8">
          <div className="w-full text-red-500/20">
            <Chart
              title="Weekly New Users"
              timeInterval="week"
              id="weekly"
              aspect={4 / 3}
            />
          </div>
          <div className="w-full text-red-500/20">
            <Chart
              title="Monthly New Users"
              timeInterval="month"
              id="monthly"
              aspect={4 / 3}
            />
          </div>
          <div className="w-full text-purple-500/20">
            <Chart
              title="Frequency Per Month"
              timeInterval="month"
              id="frequency"
              aspect={4 / 3}
            />
          </div>
        </div>

        <Card className="bg-white rounded-lg p-4 mt-8 flex-col border-t border-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="w-full text-2xl text-gray-500 mb-2.5 flex items-center justify-between ">
              User Overview
            </h2>
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
                    if (overviewStats) {
                      const filtered = overviewStats.users.filter((user) =>
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
                      <div key={family._id}>{family.name}</div>
                    ))}
                  </TableCell>
                  <TableCell>
                    {user.families.map((family) => (
                      <div key={family._id}>{family.memberCount}</div>
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
