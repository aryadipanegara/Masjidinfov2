"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MessageCircleIcon,
  TrendingUpIcon,
  ClockIcon,
  CalendarIcon,
} from "lucide-react";
import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";
import { CommentService } from "@/service/comment.service";
import type {
  Comment,
  CommentFilters,
  CommentResponse,
} from "@/types/comment.types";
import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";
import useSWR from "swr";
import { ConfirmationDialog } from "../confirmation-dialog";

interface CommentSectionProps {
  postId: string;
}

const sortOptions = [
  { value: "recent", label: "Terbaru", icon: ClockIcon },
  { value: "popular", label: "Terpopuler", icon: TrendingUpIcon },
  { value: "oldest", label: "Terlama", icon: CalendarIcon },
] as const;

export function CommentSection({ postId }: CommentSectionProps) {
  const [filters, setFilters] = useState<CommentFilters>({
    page: 1,
    limit: 20,
    sort: "recent",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteCommentConfirm, setShowDeleteCommentConfirm] =
    useState(false);
  const [commentToDeleteId, setCommentToDeleteId] = useState<string | null>(
    null
  );

  const {
    data: commentsResponse,
    error,
    isLoading,
    mutate,
  } = useSWR(
    [`/comments/${postId}`, filters],
    () =>
      CommentService.getByPostId(postId, {
        ...filters,
        sort: filters.sort === "oldest" ? "popular" : filters.sort,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const commentsData = commentsResponse?.data as CommentResponse;
  const comments = commentsData?.data || [];
  const totalComments = commentsData?.pagination?.totalItems || 0;

  const handleCreateComment = async (content: string, parentId?: string) => {
    setSubmitting(true);
    try {
      await CommentService.create(postId, content, parentId);
      await mutate();
      notify.success("Komentar berhasil ditambahkan!");
    } catch (err) {
      handleErrorResponse(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (
    commentId: string,
    isCurrentlyLiked: boolean
  ) => {
    try {
      if (isCurrentlyLiked) {
        await CommentService.unlike(commentId);
      } else {
        await CommentService.like(commentId);
      }
      await mutate(
        (currentData) => {
          if (!currentData?.data?.data) return currentData;
          const updateCommentLike = (comments: Comment[]): Comment[] => {
            return comments.map((comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  isLiked: !isCurrentlyLiked,
                  totalLikes: isCurrentlyLiked
                    ? comment.totalLikes - 1
                    : comment.totalLikes + 1,
                };
              }
              if (comment.replies && comment.replies.length > 0) {
                return {
                  ...comment,
                  replies: updateCommentLike(comment.replies),
                };
              }
              return comment;
            });
          };
          return {
            ...currentData,
            data: {
              ...currentData.data,
              data: updateCommentLike(currentData.data.data),
            },
          };
        },
        { revalidate: false }
      );
      setTimeout(() => mutate(), 500);
    } catch (err) {
      handleErrorResponse(err);
      mutate();
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      await CommentService.update(commentId, content);
      await mutate();
      notify.success("Komentar berhasil diperbarui!");
    } catch (err) {
      handleErrorResponse(err);
    }
  };

  const confirmDeleteComment = async () => {
    if (!commentToDeleteId) return;
    try {
      await CommentService.delete(commentToDeleteId);
      await mutate();
      notify.success("Komentar berhasil dihapus!");
    } catch (err) {
      handleErrorResponse(err);
    } finally {
      setShowDeleteCommentConfirm(false);
      setCommentToDeleteId(null);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setCommentToDeleteId(commentId);
    setShowDeleteCommentConfirm(true);
  };

  const handleReply = async (
    postId: string,
    parentId: string,
    content: string
  ) => {
    await handleCreateComment(content, parentId);
  };

  const handleSortChange = (sort: CommentFilters["sort"]) => {
    setFilters((prev) => ({ ...prev, sort, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <MessageCircleIcon className="h-6 w-6 text-gray-600 flex-shrink-0" />
          <h3 className="text-lg sm:text-xl font-semibold">
            {totalComments} Komentar
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                variant={filters.sort === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange(option.value)}
                className="h-8 flex items-center text-sm"
              >
                <Icon className="h-3 w-3 mr-1" />
                <span className="hidden xs:inline">{option.label}</span>
                <span className="xs:hidden">{option.label.slice(0, 5)}...</span>
              </Button>
            );
          })}
        </div>
      </div>
      <Separator />
      <CommentForm
        onSubmit={(content) => handleCreateComment(content)}
        loading={submitting}
      />
      <Separator />
      <div className="space-y-1">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 py-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                  <div className="h-16 bg-gray-200 rounded animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
                    <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Gagal memuat komentar</p>
            <Button onClick={() => mutate()}>Coba Lagi</Button>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Belum ada komentar</p>
            <p className="text-sm text-gray-400">
              Jadilah yang pertama berkomentar!
            </p>
          </div>
        ) : (
          <>
            {comments.map((comment: Comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                onReply={handleReply}
                onLike={handleLikeComment}
                onEdit={handleEditComment}
                onDelete={async (commentId: string) =>
                  handleDeleteComment(commentId)
                }
              />
            ))}
            {/* Load More */}
            {commentsData?.pagination?.hasNextPage && (
              <div className="text-center pt-6">
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))
                  }
                >
                  Muat Lebih Banyak
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Comment Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteCommentConfirm}
        onOpenChange={setShowDeleteCommentConfirm}
        title="Hapus Komentar?"
        description="Anda yakin ingin menghapus komentar ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={confirmDeleteComment}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="destructive"
      />
    </div>
  );
}
