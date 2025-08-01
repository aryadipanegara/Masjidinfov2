"use client";

import {
  MessageSquare,
  Users,
  FileText,
  TrendingUp,
  Activity,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import useSWR from "swr";
import { PostService } from "@/service/posts.service";
import { UserService } from "@/service/users.service";
import { AnnouncementService } from "@/service/announcement.service";
import { CommentService } from "@/service/comment.service";

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  activeUsers: number;
  userGrowth: number;
  postGrowth: number;
  commentGrowth: number;
  activeGrowth: number;
}

interface RecentPost {
  id: string;
  title: string;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
  status: string;
  views?: number;
}

interface RecentComment {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  postTitle: string;
  createdAt: string;
}

interface Announcement {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const chartConfig = {
  users: {
    label: "Users",
    color: "hsl(var(--chart-1))",
  },
  posts: {
    label: "Posts",
    color: "hsl(var(--chart-2))",
  },
  comments: {
    label: "Comments",
    color: "hsl(var(--chart-3))",
  },
};

// SWR fetcher functions
const fetchDashboardData = async () => {
  const [postsResponse, usersResponse, announcementsResponse] =
    await Promise.all([
      PostService.getAll({ limit: 10 }),
      UserService.getUsers({ limit: 10 }),
      AnnouncementService.getAll({ limit: 5 }),
    ]);

  return {
    posts: postsResponse.data,
    users: usersResponse.data,
    announcements: announcementsResponse.data,
  };
};

const fetchCommentsForPost = async (postId: string) => {
  if (!postId) return { data: [] };
  const response = await CommentService.getByPostId(postId, { limit: 5 });
  return response.data;
};

export default function AdminDashboardPage() {
  // Mock chart data - you can replace this with real historical data if available
  const mockChartData = [
    { month: "Jan", users: 186, posts: 80, comments: 120 },
    { month: "Feb", users: 305, posts: 200, comments: 180 },
    { month: "Mar", users: 237, posts: 120, comments: 150 },
    { month: "Apr", users: 273, posts: 190, comments: 200 },
    { month: "May", users: 209, posts: 130, comments: 170 },
    { month: "Jun", users: 314, posts: 140, comments: 220 },
  ];

  // SWR hooks for data fetching
  const {
    data: dashboardData,
    error: dashboardError,
    isLoading: dashboardLoading,
  } = useSWR("dashboard-data", fetchDashboardData, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  });

  // Get first post ID for comments
  const firstPostId = dashboardData?.posts?.data?.[0]?.id;

  const { data: commentsData, error: commentsError } = useSWR(
    firstPostId ? `comments-${firstPostId}` : null,
    () => fetchCommentsForPost(firstPostId),
    {
      refreshInterval: 60000, // Refresh every minute
    }
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Transform data
  const stats: DashboardStats = dashboardData
    ? {
        totalUsers: dashboardData.users.pagination?.totalItems || 0,
        totalPosts: dashboardData.posts.pagination?.totalItems || 0,
        totalComments: 0, // You might need to add a separate endpoint for total comments
        activeUsers: Math.floor(
          (dashboardData.users.pagination?.totalItems || 0) * 0.1
        ), // Estimate 10% active
        userGrowth: 20.1, // You can calculate this from historical data
        postGrowth: 12.5,
        commentGrowth: 8.3,
        activeGrowth: 5.2,
      }
    : {
        totalUsers: 0,
        totalPosts: 0,
        totalComments: 0,
        activeUsers: 0,
        userGrowth: 0,
        postGrowth: 0,
        commentGrowth: 0,
        activeGrowth: 0,
      };

  // Transform posts data
  const recentPosts: RecentPost[] =
    dashboardData?.posts?.data?.map((post: any) => ({
      id: post.id,
      title: post.title,
      author: {
        name: post.author?.name || post.user?.name || "Unknown Author",
        avatar: post.author?.avatar || post.user?.avatar,
      },
      createdAt: post.createdAt,
      status: post.status || "published",
      views: post.views || 0,
    })) || [];

  // Transform comments data
  const recentComments: RecentComment[] =
    commentsData?.data?.map((comment: any) => ({
      id: comment.id,
      content: comment.content,
      author: {
        name: comment.author?.name || comment.user?.name || "Anonymous",
        avatar: comment.author?.avatar || comment.user?.avatar,
      },
      postTitle: dashboardData?.posts?.data?.[0]?.title || "Unknown Post",
      createdAt: comment.createdAt,
    })) || [];

  // Transform announcements data
  const announcements: Announcement[] =
    dashboardData?.announcements?.data || dashboardData?.announcements || [];

  if (dashboardLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        {/* Loading skeletons */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px] mb-2" />
                <Skeleton className="h-3 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="h-4 w-[250px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-[60%]" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load dashboard data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="space-y-4">
          {announcements.slice(0, 2).map((announcement) => (
            <Alert key={announcement.id} className="border-blue-200 bg-blue-50">
              <Activity className="h-4 w-4" />
              <AlertTitle>Pengumuman</AlertTitle>
              <AlertDescription>
                {announcement.content}
                <span className="block text-xs text-muted-foreground mt-1">
                  {formatDate(announcement.createdAt)}
                </span>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pengguna
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.userGrowth}%</span> dari
              bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Postingan
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalPosts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.postGrowth}%</span> dari
              bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Komentar
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalComments.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.commentGrowth}%</span>{" "}
              dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pengguna Aktif
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.activeGrowth}%</span>{" "}
              dari minggu lalu
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Charts */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Statistik Bulanan</CardTitle>
            <CardDescription>
              Pertumbuhan pengguna, postingan, dan komentar dalam 6 bulan
              terakhir
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <AreaChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="users"
                  stackId="1"
                  stroke="var(--color-users)"
                  fill="var(--color-users)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="posts"
                  stackId="1"
                  stroke="var(--color-posts)"
                  fill="var(--color-posts)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="comments"
                  stackId="1"
                  stroke="var(--color-comments)"
                  fill="var(--color-comments)"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>
              Postingan dan komentar terbaru dari pengguna
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div>
                <h4 className="text-sm font-medium mb-3">Postingan Terbaru</h4>
                <div className="space-y-3">
                  {recentPosts.slice(0, 3).map((post) => (
                    <div key={post.id} className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={post.author.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {post.author.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {post.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          oleh {post.author.name} • {formatDate(post.createdAt)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          post.status === "published" ? "default" : "secondary"
                        }
                      >
                        {post.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">Komentar Terbaru</h4>
                <div className="space-y-3">
                  {recentComments.slice(0, 3).map((comment) => (
                    <div
                      key={comment.id}
                      className="flex items-start space-x-3"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={comment.author.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {comment.author.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {comment.postTitle}
                        </p>
                        <p className="text-sm">{comment.content}</p>
                        <p className="text-xs text-muted-foreground">
                          oleh {comment.author.name} •{" "}
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Postingan per Bulan</CardTitle>
            <CardDescription>
              Jumlah postingan yang dipublikasikan setiap bulan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="posts" fill="var(--color-posts)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pertumbuhan Pengguna</CardTitle>
            <CardDescription>Tren pertumbuhan pengguna baru</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="var(--color-users)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-users)" }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
