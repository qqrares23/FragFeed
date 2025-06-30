import { MessageCircle, Trash2, ArrowUp, ArrowDown, Share2, Bookmark, Bookmark as BookmarkCheck, Flag, Edit2, Eye, Clock, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PaginationStatus, useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import Comment from "./Comment";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [viewCount, setViewCount] = useState(Math.floor(Math.random() * 1000) + 50);
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

  // Simulate view tracking
  useEffect(() => {
    if (expandedView) {
      setViewCount(prev => prev + 1);
    }
  }, [expandedView]);

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

  const handleShare = async (platform?: string) => {
    const url = `${window.location.origin}/post/${post._id}`;
    const text = `Check out this post: ${post.subject}`;

    if (platform === 'copy') {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'reddit') {
      window.open(`https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(post.subject)}`, '_blank');
    } else {
      if (navigator.share) {
        await navigator.share({ title: post.subject, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      }
    }
    setShowShareMenu(false);
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // In a real app, this would save to backend
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getEngagementLevel = () => {
    const totalVotes = (voteCounts?.upvotes || 0) + (voteCounts?.downvotes || 0);
    const comments = commentCount || 0;
    const engagement = totalVotes + comments * 2;
    
    if (engagement > 50) return 'high';
    if (engagement > 20) return 'medium';
    return 'low';
  };

  const engagementLevel = getEngagementLevel();

  return (
    <TooltipProvider>
      <Card className={`${expandedView ? 'p-0' : 'p-4 lg:p-6'} ${expandedView ? '' : 'hover:-translate-y-1 transition-all duration-300 hover:shadow-xl'} ${
        engagementLevel === 'high' ? 'ring-2 ring-yellow-200 dark:ring-yellow-800' : 
        engagementLevel === 'medium' ? 'ring-1 ring-blue-200 dark:ring-blue-800' : ''
      }`}>
        <CardContent className={expandedView ? "p-0" : ""}>
          <div className="flex gap-3 lg:gap-4">
            {/* Enhanced Vote Section */}
            <div className="flex flex-col items-center gap-1 pt-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={user ? onUpvote : () => {}}
                    disabled={!user}
                    className={`p-1.5 lg:p-2 transition-all duration-200 ${
                      hasUpvoted
                        ? 'bg-orange-100 text-orange-600 hover:bg-orange-200 scale-110'
                        : 'text-slate-400 hover:bg-slate-100 hover:text-orange-500 hover:scale-110'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <ArrowUp className="w-3 h-3 lg:w-4 lg:h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{user ? 'Upvote' : 'Sign in to vote'}</p>
                </TooltipContent>
              </Tooltip>
              
              <span className={`text-xs lg:text-sm font-bold transition-colors ${
                (voteCounts?.total || 0) > 0 ? 'text-orange-600' : 
                (voteCounts?.total || 0) < 0 ? 'text-blue-600' : 'text-slate-500'
              }`}>
                {voteCounts?.total || 0}
              </span>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={user ? onDownvote : () => {}}
                    disabled={!user}
                    className={`p-1.5 lg:p-2 transition-all duration-200 ${
                      hasDownvoted
                        ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 scale-110'
                        : 'text-slate-400 hover:bg-slate-100 hover:text-blue-500 hover:scale-110'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <ArrowDown className="w-3 h-3 lg:w-4 lg:h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{user ? 'Downvote' : 'Sign in to vote'}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Enhanced Content */}
            <div className="flex-1 min-w-0">
              {/* Enhanced Header */}
              <div className="flex items-center gap-2 text-xs lg:text-sm text-slate-500 mb-2 flex-wrap">
                {post.author ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-xs">
                        {post.author.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Link 
                      to={`/u/${post.author.username}`}
                      className="font-medium text-slate-700 hover:text-primary-600 transition-colors"
                    >
                      u/{post.author.username}
                    </Link>
                  </div>
                ) : (
                  <span className="text-slate-400">u/deleted</span>
                )}

                {showSubreddit && post.subreddit && (
                  <>
                    <span>•</span>
                    <Link 
                      to={`/r/${post.subreddit.name}`}
                      className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      r/{post.subreddit.name}
                    </Link>
                  </>
                )}
                
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(post._creationTime)}</span>
                </div>

                {/* Engagement Badge */}
                {engagementLevel === 'high' && (
                  <>
                    <span>•</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  </>
                )}

                {expandedView && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{viewCount} views</span>
                    </div>
                  </>
                )}
              </div>

              {/* Enhanced Title and Content */}
              {expandedView ? (
                <div className="space-y-4">
                  <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100">{post.subject}</h1>
                  {post.imageUrl && (
                    <div className="rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                      <img 
                        src={post.imageUrl} 
                        alt="Post content" 
                        className="w-full max-h-96 object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
                        onClick={() => window.open(post.imageUrl, '_blank')}
                      />
                    </div>
                  )}
                  {post.body && (
                    <div className="prose prose-slate max-w-none dark:prose-invert">
                      <p className="whitespace-pre-wrap text-sm lg:text-base leading-relaxed">{post.body}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <h2 className="text-base lg:text-lg font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-primary-600 transition-colors cursor-pointer"
                      onClick={() => navigate(`/post/${post._id}`)}>
                    {post.subject}
                  </h2>
                  <div className="flex gap-3 lg:gap-4">
                    <div className="flex-1">
                      {post.body && (
                        <p className="text-slate-600 dark:text-slate-400 line-clamp-3 text-sm lg:text-base">{post.body}</p>
                      )}
                    </div>
                    {post.imageUrl && (
                      <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:scale-105 transition-transform duration-300">
                        <img 
                          src={post.imageUrl} 
                          alt="Post content" 
                          className="w-full h-full object-cover"
                          onClick={() => navigate(`/post/${post._id}`)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Enhanced Actions */}
              <div className="flex items-center gap-2 lg:gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={handleComment}
                  className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <MessageCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="text-xs lg:text-sm font-medium">{commentCount || 0}</span>
                </Button>

                <div className="relative">
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center gap-2 hover:bg-green-50 hover:text-green-600 transition-colors"
                  >
                    <Share2 className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="text-xs lg:text-sm font-medium">Share</span>
                  </Button>

                  {showShareMenu && (
                    <div className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 min-w-[150px]">
                      <button
                        onClick={() => handleShare('copy')}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-sm"
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-sm"
                      >
                        Share on Twitter
                      </button>
                      <button
                        onClick={() => handleShare('reddit')}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-sm"
                      >
                        Share on Reddit
                      </button>
                    </div>
                  )}
                </div>

                {user && (
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={toggleBookmark}
                    className={`flex items-center gap-2 transition-colors ${
                      isBookmarked 
                        ? 'text-yellow-600 hover:bg-yellow-50' 
                        : 'hover:bg-yellow-50 hover:text-yellow-600'
                    }`}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-3 h-3 lg:w-4 lg:h-4" />
                    ) : (
                      <Bookmark className="w-3 h-3 lg:w-4 lg:h-4" />
                    )}
                  </Button>
                )}
                
                {ownedByCurrentUser && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit2 className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span className="text-xs lg:text-sm font-medium">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span className="text-xs lg:text-sm font-medium">Delete</span>
                    </Button>
                  </>
                )}

                {!ownedByCurrentUser && user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-orange-500 hover:text-orange-700 hover:bg-orange-50 ml-auto"
                  >
                    <Flag className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="text-xs lg:text-sm font-medium">Report</span>
                  </Button>
                )}
              </div>

              {/* Enhanced Comments Section */}
              {(showComments || expandedView) && (
                <div className="mt-6 space-y-4">
                  {user && (
                    <form onSubmit={handleSubmitComment} className="space-y-3">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="What are your thoughts?"
                        rows={3}
                        className="resize-none"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">
                          {newComment.length}/1000 characters
                        </span>
                        <Button
                          type="submit"
                          disabled={!newComment.trim() || newComment.length > 1000}
                          size="sm"
                        >
                          Comment
                        </Button>
                      </div>
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
    </TooltipProvider>
  );
};

export default PostCard;