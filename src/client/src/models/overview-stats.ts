export default interface OverviewStats {
  totalUsers: number;
  totalFamilies: number;
  totalAdmins: number;
  totalFrequency: {
    data: { _id: { year: number; month: number }; totalConnections: number }[];
    total: number;
  };
}
