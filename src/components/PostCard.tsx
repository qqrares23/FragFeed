import { MessageCircle, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PaginationStatus, useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import Comment from "./Comment";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Post {
  _id: Id<"post">;
  subject: string;
  body: string;
  _creationTime: number;
  authorId: string;
  imageUrl?: string;
  author?: {
    username: string;
  };
  subreddit?: {
    _id: Id<"subreddit">;
    name: string;
  };
}

interface PostCardProps {
  post: Post;
  showSubreddit?: boolean;
  expandedView?: boolean;
}

const PostCard = ({
  post,
  showSubreddit = false,
  expandedView = false,
}: PostCardProps) => {
  const [showComments, setShowComments] = useState(expandedView);
  const navigate = useNavigate();
  const { user } = useUser();
  const ownedByCurrentUser = post.author?.username === user?.username;

  const deletePost = useMutation(api.post.deletePost);
  const createComment = useMutation(api.comments.create);
  const deleteComment = useMutation(api.comments.deleteComment);
  const toggleUpvote = useMutation(api.vote.toggleUpvote);
  const toggleDownvote = useMutation(api.vote.toggleDownvote);

  const voteCounts = useQuery(api.vote.getVoteCounts, { postId: post._id });
  const hasUpvoted = useQuery(api.vote.hasUpvoted, { postId: post._id });
  const hasDownvoted = useQuery(api.vote.hasDownvoted, { postId: post._id });

  const { results: comments, loadMore, status } = usePaginatedQuery(
    api.comments.getComments,
    { postId: post._id },
    { initialNumItems: 20 }
  );
  const commentCount = useQuery(api.comments.getCommentCount, {
    postId: post._id,
  });

  const [newComment, setNewComment] = useState("");

  const onUpvote = () => toggleUpvote({ postId: post._id });
  const onDownvote = () => toggleDownvote({ postId: post._id });

  const handleComment = () => {
    if (!expandedView) {
      navigate(`/post/${post._id}`);
    } else {
      setShowComments(!showComments);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you would like to delete this?")) {
      await deletePost({ id: post._id });
      if (expandedView) {
        navigate("/");
      }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      await deleteComment({ id: commentId as Id<"comments"> });
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    await createComment({
      content: newComment.trim(),
      postId: post._id,
    });
    setNewComment("");
  };

  return (
    <Card className={`${expandedView ? 'p-0' : 'p-4 lg:p-6'} ${expandedView ? '' : 'hover:-translate-y-1 transition-transform'}`}>
      <CardContent className={expandedView ? "p-0" : ""}>
        <div className="flex gap-3 lg:gap-4">
          {/* Vote Section */}
          <div className="flex flex-col items-center gap-1 pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={user ? onUpvote : () => {}}
              disabled={!user}
              className={`p-1.5 lg:p-2 ${
                hasUpvoted
                  ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-orange-500'
              } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ArrowUp className="w-3 h-3 lg:w-4 lg:h-4" />
            </Button>
            
            <span className={`text-xs lg:text-sm font-semibold ${
              (voteCounts?.total || 0) > 0 ? 'text-orange-600' : 
              (voteCounts?.total || 0) < 0 ? 'text-blue-600' : 'text-slate-500'
            }`}>
              {voteCounts?.total || 0}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={user ? onDownvote : () => {}}
              disabled={!user}
              className={`p-1.5 lg:p-2 ${
                hasDownvoted
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-blue-500'
              } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ArrowDown className="w-3 h-3 lg:w-4 lg:h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 text-xs lg:text-sm text-slate-500 mb-2 flex-wrap">
              {post.author ? (
                <Link 
                  to={`/u/${post.author.username}`}
                  className="font-medium text-slate-700 hover:text-primary-600"
                >
                  u/{post.author.username}
                </Link>
              ) : (
                <span className="text-slate-400">u/deleted</span>
              )}

              {showSubreddit && post.subreddit && (
                <>
                  <span>•</span>
                  <Link 
                    to={`/r/${post.subreddit.name}`}
                    className="font-medium text-primary-600 hover:text-primary-700"
                  >
                    r/{post.subreddit.name}
                  </Link>
                </>
              )}
              
              <span>•</span>
              <span>{new Date(post._creationTime).toLocaleDateString()}</span>
            </div>

            {/* Title and Content */}
            {expandedView ? (
              <div className="space-y-4">
                <h1 className="text-xl lg:text-2xl font-bold text-slate-900">{post.subject}</h1>
                {post.imageUrl && (
                  <div className="rounded-xl overflow-hidden">
                    <img 
                      src={post.imageUrl} 
                      alt="Post content" 
                      className="w-full max-h-96 object-contain bg-slate-50"
                    />
                  </div>
                )}
                {post.body && (
                  <div className="prose prose-slate max-w-none">
                    <p className="whitespace-pre-wrap text-sm lg:text-base">{post.body}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <h2 className="text-base lg:text-lg font-semibold text-slate-900 line-clamp-2">
                  {post.subject}
                </h2>
                <div className="flex gap-3 lg:gap-4">
                  <div className="flex-1">
                    {post.body && (
                      <p className="text-slate-600 line-clamp-3 text-sm lg:text-base">{post.body}</p>
                    )}
                  </div>
                  {post.imageUrl && (
                    <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={post.imageUrl} 
                        alt="Post content" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 lg:gap-4 mt-4 pt-3 border-t border-slate-100">
              <Button 
                variant="ghost"
                size="sm"
                onClick={handleComment}
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="text-xs lg:text-sm font-medium">{commentCount || 0} Comments</span>
              </Button>
              
              {ownedByCurrentUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="flex items-center gap-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="text-xs lg:text-sm font-medium">Delete</span>
                </Button>
              )}
            </div>

            {/* Comments Section */}
            {(showComments || expandedView) && (
              <div className="mt-6 space-y-4">
                {user && (
                  <form onSubmit={handleSubmitComment} className="space-y-3">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="What are your thoughts?"
                      rows={3}
                    />
                    <Button
                      type="submit"
                      disabled={!newComment.trim()}
                      size="sm"
                    >
                      Comment
                    </Button>
                  </form>
                )}
                
                <div className="space-y-3">
                  {comments?.map((comment) => (
                    <Comment 
                      key={comment._id} 
                      comment={comment} 
                      canDelete={comment.authorId === user?.id}
                      onDelete={() => handleDeleteComment(comment._id)}
                    />
                  ))}
                </div>
                
                {status === "CanLoadMore" && (
                  <Button 
                    variant="outline"
                    onClick={() => loadMore(20)}
                    className="w-full"
                  >
                    Load More Comments
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;