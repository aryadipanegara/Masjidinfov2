"use client";

import { useState } from "react";
import {
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Reply,
  Flag,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";
import AxiosInstance from "@/lib/axios";

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    fullname: string;
    email: string;
    avatar?: string;
  };
  post: {
    id: string;
    title: string;
    slug: string;
  };
  parentId?: string;
  isApproved: boolean;
  isFlagged: boolean;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

const COMMENT_STATUS = [
  { value: "all", label: "Semua Status" },
  { value: "approved", label: "Disetujui" },
  { value: "pending", label: "Menunggu" },
  { value: "flagged", label: "Dilaporkan" },
];

// Direct API calls to avoid service import issues
const fetchComments = async (url: string) => {
  const [, searchQuery, selectedStatus] = url.split("|");

  const response = await AxiosInstance.get("/comments", {
    params: { page: 1, limit: 10 },
  });
  let filteredComments = response.data.data || [];

  if (searchQuery && searchQuery !== "undefined") {
    filteredComments = filteredComments.filter(
      (comment: Comment) =>
        comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.author.fullname
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        comment.post.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (selectedStatus !== "all") {
    switch (selectedStatus) {
      case "approved":
        filteredComments = filteredComments.filter(
          (comment: Comment) => comment.isApproved
        );
        break;
      case "pending":
        filteredComments = filteredComments.filter(
          (comment: Comment) => !comment.isApproved && !comment.isFlagged
        );
        break;
      case "flagged":
        filteredComments = filteredComments.filter(
          (comment: Comment) => comment.isFlagged
        );
        break;
    }
  }

  return {
    data: filteredComments,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: filteredComments.length,
      itemsPerPage: 10,
    },
  };
};

// Inline utility functions
const getStatusBadge = (comment: Comment) => {
  if (comment.isFlagged) {
    return <Badge variant="destructive">Dilaporkan</Badge>;
  }
  if (comment.isApproved) {
    return <Badge variant="default">Disetujui</Badge>;
  }
  return <Badge variant="secondary">Menunggu</Badge>;
};

const detectSuspiciousContent = (content: string): boolean => {
  const suspiciousPatterns = [
    /https?:\/\/[^\s]+/gi, // URLs
    /spam/gi,
    /click here/gi,
    /free money/gi,
    /win now/gi,
  ];
  return suspiciousPatterns.some((pattern) => pattern.test(content));
};

export default function CommentsManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

  const swrKey = `comments|${searchQuery}|${selectedStatus}|${currentPage}`;

  const {
    data: commentsData,
    error,
    isLoading,
    mutate: mutateComments,
  } = useSWR(swrKey, fetchComments, {
    revalidateOnFocus: false,
    refreshInterval: 30000,
  });

  const comments = commentsData?.data || [];
  const totalPages = commentsData?.pagination?.totalPages || 1;
  const totalItems = commentsData?.pagination?.totalItems || 0;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleApproveComment = async (commentId: string) => {
    try {
      // Mock implementation - replace with actual API call
      console.log("Approving comment:", commentId);
      mutateComments();
    } catch (error) {
      console.error("Error approving comment:", error);
    }
  };

  const handleFlagComment = async (commentId: string) => {
    try {
      // Mock implementation - replace with actual API call
      console.log("Flagging comment:", commentId);
      mutateComments();
    } catch (error) {
      console.error("Error flagging comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await AxiosInstance.delete(`/comments/${commentId}`);
      mutateComments();
      setDeleteCommentId(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Moderasi Komentar
          </h2>
          <p className="text-muted-foreground">
            Kelola dan moderasi komentar dari pengguna
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Error loading comments. Please try again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Moderasi Komentar</h2>
        <p className="text-muted-foreground">
          Kelola dan moderasi komentar dari pengguna
        </p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
          <CardDescription>
            Cari dan filter komentar berdasarkan status dan konten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan konten, author, atau postingan..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                {COMMENT_STATUS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Komentar ({totalItems} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start space-x-4 p-4 border rounded-lg"
                >
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <Skeleton className="h-6 w-[80px]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment: Comment) => (
                <div
                  key={comment.id}
                  className={`p-4 border rounded-lg ${
                    comment.isFlagged
                      ? "border-red-200 bg-red-50"
                      : !comment.isApproved
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={comment.author.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">
                            {comment.author.fullname}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {comment.author.email}
                          </p>
                          {getStatusBadge(comment)}
                          {detectSuspiciousContent(comment.content) && (
                            <Badge
                              variant="outline"
                              className="text-orange-600 border-orange-600"
                            >
                              <Flag className="h-3 w-3 mr-1" />
                              Mencurigakan
                            </Badge>
                          )}
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <p className="text-sm">{comment.content}</p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Postingan: {comment.post.title}</span>
                          <span>•</span>
                          <span>{comment.likesCount} likes</span>
                          <span>•</span>
                          <span>{formatDate(comment.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        {!comment.isApproved && (
                          <DropdownMenuItem
                            onClick={() => handleApproveComment(comment.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            Setujui
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleFlagComment(comment.id)}
                        >
                          <Flag className="mr-2 h-4 w-4 text-orange-600" />
                          {comment.isFlagged ? "Unflag" : "Flag"}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Reply className="mr-2 h-4 w-4" />
                          Balas
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteCommentId(comment.id)}
                          className="text-red-600"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteCommentId}
        onOpenChange={() => setDeleteCommentId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Komentar</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus komentar ini? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteCommentId && handleDeleteComment(deleteCommentId)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
