"use client";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  HeartIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  EditIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import type { Comment } from "@/types/comment.types";
import { useAuth } from "@/app/providers";

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onReply: (postId: string, parentId: string, content: string) => Promise<void>;
  onLike: (commentId: string, isCurrentlyLiked: boolean) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  depth?: number;
}

export function CommentItem({
  comment,
  postId,
  onReply,
  onLike,
  onEdit,
  onDelete,
  depth = 0,
}: CommentItemProps) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState(comment.content);
  const [isLiking, setIsLiking] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const isOwner = user?.id === comment.authorId;
  const canModerate =
    user && ["ADMIN", "SUPER_ADMIN"].includes(user.role || "");

  const handleReplySubmit = async () => {
    if (replyContent.trim() && !isReplying) {
      setIsReplying(true);
      try {
        await onReply(postId, comment.id, replyContent.trim());
        setReplyContent("");
        setShowReplyForm(false);
        setShowReplies(true);
      } catch (error) {
        console.error("Error submitting reply:", error);
      } finally {
        setIsReplying(false);
      }
    }
  };

  const handleEditSubmit = async () => {
    if (editContent.trim() && editContent !== comment.content) {
      try {
        await onEdit(comment.id, editContent.trim());
        setIsEditing(false);
      } catch (error) {
        console.error("Error editing comment:", error);
      }
    }
  };

  const handleLike = async () => {
    if (!isLiking) {
      setIsLiking(true);
      try {
        await onLike(comment.id, comment.isLiked);
      } catch (error) {
        console.error("Error liking comment:", error);
      } finally {
        setIsLiking(false);
      }
    }
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return null;
    const badges = {
      SUPER_ADMIN: { label: "SUPER ADMIN", color: "bg-red-500 text-white" },
      ADMIN: { label: "ADMIN", color: "bg-purple-500 text-white" },
      EDITOR: { label: "EDITOR", color: "bg-blue-500 text-white" },
      MODERATOR: { label: "MOD", color: "bg-green-500 text-white" },
      VIP: { label: "VIP", color: "bg-yellow-500 text-black" },
    };
    return badges[role as keyof typeof badges];
  };

  const roleBadge = getRoleBadge(comment.author.role);

  return (
    <div
      className={`${depth > 0 ? "ml-8 border-l-2 border-gray-100 pl-4" : ""}`}
    >
      <div className="flex gap-3 py-4">
        {/* Avatar */}
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage
            src={
              comment.author.avatar ||
              "/placeholder.svg?height=40&width=40&query=user avatar"
            }
            alt={comment.author.fullname}
          />
          <AvatarFallback className="text-sm">
            {comment.author.fullname
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-900 truncate">
              {comment.author.fullname}
            </span>
            {roleBadge && (
              <Badge className={`text-xs px-2 py-0.5 ${roleBadge.color}`}>
                {roleBadge.label}
              </Badge>
            )}
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: id,
              })}
            </span>
            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
              <span className="text-xs text-gray-400">(diedit)</span>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-2 mb-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px] resize-none"
                placeholder="Edit komentar..."
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEditSubmit}>
                  Simpan
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  Batal
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 mb-3 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking || !user}
              className={`h-8 px-2 transition-colors ${
                comment.isLiked
                  ? "text-red-500 hover:text-red-600"
                  : "text-gray-500 hover:text-red-500"
              }`}
            >
              <HeartIcon
                className={`h-4 w-4 mr-1 transition-all ${
                  comment.isLiked ? "fill-current scale-110" : ""
                }`}
              />
              {comment.totalLikes > 0 && (
                <span className="text-sm">{comment.totalLikes}</span>
              )}
            </Button>

            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="h-8 px-2 text-gray-500 hover:text-blue-500"
              >
                <MessageCircleIcon className="h-4 w-4 mr-1" />
                Balas
              </Button>
            )}

            {comment.totalReplies > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="h-8 px-2 text-gray-500 hover:text-blue-500"
              >
                {showReplies ? (
                  <ChevronUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 mr-1" />
                )}
                {comment.totalReplies} balasan
              </Button>
            )}

            {(isOwner || canModerate) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwner && (
                    <DropdownMenuItem
                      onClick={() => setIsEditing(true)}
                      disabled
                    >
                      <EditIcon className="h-4 w-4 mr-2 opacity-50" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => onDelete(comment.id)}
                    className="text-red-600"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && user && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Tulis balasan..."
                className="min-h-[80px] resize-none"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleReplySubmit}
                  disabled={isReplying}
                >
                  {isReplying ? "Mengirim..." : "Balas"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent("");
                  }}
                >
                  Batal
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  onReply={onReply}
                  onLike={onLike}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
