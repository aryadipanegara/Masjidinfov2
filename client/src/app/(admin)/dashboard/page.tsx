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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import AxiosInstance from "@/lib/axios";
import { Post } from "@/types/posts.types";
import { Comment } from "@/types/comment.types";
import { Announcement } from "@/types/announcement.types";
import { UserDetail } from "@/types/user.types";

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    activeUsers: 0,
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Using direct API calls instead of service imports to avoid module resolution issues
        const [
          usersResponse,
          postsResponse,
          commentsResponse,
          announcementsResponse,
        ] = await Promise.all([
          AxiosInstance.get("/users", { params: { page: 1, limit: 100 } }),
          AxiosInstance.get("/posts", { params: { page: 1, limit: 10 } }),
          AxiosInstance.get("/comments", { params: { page: 1, limit: 10 } }),
          AxiosInstance.get("/announcement", { params: { page: 1, limit: 5 } }),
        ]);

        const usersData = usersResponse.data;
        const totalUsers =
          usersData.paginations?.total || usersData.data?.length || 0;
        const activeUsers =
          usersData.data?.filter((user: UserDetail) => user.status === "ACTIVE")
            ?.length || 0;

        const postsData = postsResponse.data;
        const totalPosts =
          postsData.pagination?.total || postsData.data?.length || 0;
        const recentPosts = postsData.data || [];

        const commentsData = commentsResponse.data;
        const totalComments =
          commentsData.pagination?.total || commentsData.data?.length || 0;
        const recentComments = commentsData.data || [];

        const announcementsData = announcementsResponse.data;
        const recentAnnouncements = announcementsData.data || [];

        setStats({
          totalUsers,
          totalPosts,
          totalComments,
          activeUsers,
        });

        setPosts(recentPosts);
        setComments(recentComments);
        setAnnouncements(recentAnnouncements);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setError(
          "Gagal memuat data dashboard. Pastikan API URL sudah dikonfigurasi dengan benar."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

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
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <br />
            <small className="text-xs opacity-75">
              Periksa pengaturan environment variable NEXT_PUBLIC_API_URL di
              Project Settings.
            </small>
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

      {/* Using real announcements data with message field */}
      {announcements.length > 0 && (
        <div className="space-y-4">
          {announcements.slice(0, 2).map((announcement) => (
            <Alert key={announcement.id} className="border-blue-200 bg-blue-50">
              <Activity className="h-4 w-4" />
              <AlertTitle>Pengumuman</AlertTitle>
              <AlertDescription>
                {announcement.message}
                <span className="block text-xs text-muted-foreground mt-1">
                  {formatDate(announcement.createdAt)}
                </span>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

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
            <p className="text-xs text-muted-foreground">Pengguna terdaftar</p>
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
              Postingan dipublikasikan
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
              Komentar dari pengguna
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
              Pengguna dengan status aktif
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <Card>
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
                  {posts.slice(0, 3).map((post) => (
                    <div key={post.id} className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={post.author?.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {post.author?.fullname
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {post.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          oleh {post.author?.fullname || "Unknown"} •{" "}
                          {formatDate(post.createdAt)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          post.status === "PUBLISHED" ? "default" : "secondary"
                        }
                      >
                        {post.status === "PUBLISHED" ? "Terbit" : post.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">Komentar Terbaru</h4>
                <div className="space-y-3">
                  {comments.slice(0, 3).map((comment) => (
                    <div
                      key={comment.id}
                      className="flex items-start space-x-3"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={comment.author?.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {comment.author?.fullname
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {comment.content || "Post tidak ditemukan"}
                        </p>
                        <p className="text-sm">{comment.content}</p>
                        <p className="text-xs text-muted-foreground">
                          oleh {comment.author?.fullname || "Unknown"} •{" "}
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
    </div>
  );
}
