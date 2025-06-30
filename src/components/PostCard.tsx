import { MessageCircle, Trash2, ArrowUp, ArrowDown, Share2, Bookmark, Bookmark as BookmarkCheck, Flag, Edit2, Eye, Clock, TrendingUp, ExternalLink, MoreHorizontal } from "lucide-react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [viewCount, setViewCount] = useState(Math.floor(Math.random() * 1000) + 50);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();
  const ownedByCurrentUser = post.author?.username === user?.username;

  const deletePost = useMutation(api.post.deletePost);
  const createComment = useMutation(api.comments.create);
  const deleteComment = useMutation(api.comments.deleteComment);
  const toggleUpvote = useMutation(api.vote.toggleUpvote);
  const toggleDownvote = useMutation(api.vote.toggleDownvote);
  const savePost = useMutation(api.savedPosts.savePost);
  const unsavePost = useMutation(api.savedPosts.unsavePost);

  const voteCounts = useQuery(api.vote.getVoteCounts, { postId: post._id });
  const hasUpvoted = useQuery(api.vote.hasUpvoted, { postId: post._id });
  const hasDownvoted = useQuery(api.vote.hasDownvoted, { postId: post._id });
  const isPostSaved = useQuery(api.savedPosts.isPostSaved, { postId: post._id });

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

  const handleEdit = () => {
    navigate(`/post/${post._id}/edit`);
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

  const toggleBookmark = async () => {
    try {
      if (isPostSaved) {
        await unsavePost({ postId: post._id });
      } else {
        await savePost({ postId: post._id });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
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
      <Card className={`group relative overflow-hidden transition-all duration-300 ${
        expandedView 
          ? 'bg-white dark:bg-slate-900 shadow-xl' 
          : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl hover:-translate-y-1'
      } ${
        engagementLevel === 'high' ? 'ring-2 ring-yellow-200 dark:ring-yellow-800 shadow-yellow-100 dark:shadow-yellow-900/20' : 
        engagementLevel === 'medium' ? 'ring-1 ring-blue-200 dark:ring-blue-800' : ''
      }`}>
        
        {/* Engagement Indicator */}
        {engagementLevel === 'high' && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
        )}

        <CardContent className={`${expandedView ? 'p-6 lg:p-8' : 'p-4 lg:p-6'}`}>
          {/* Header with Author Info and Post Actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {post.author ? (
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 ring-2 ring-white dark:ring-slate-800 shadow-sm">
                    <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
                      {post.author.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <Link 
                      to={`/u/${post.author.username}`}
                      className="font-semibold text-slate-900 dark:text-slate-100 hover:text-primary-600 transition-colors text-sm"
                    >
                      u/{post.author.username}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(post._creationTime)}</span>
                      
                      {showSubreddit && post.subreddit && (
                        <>
                          <span>in</span>
                          <Link 
                            to={`/r/${post.subreddit.name}`}
                            className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
                          >
                            r/{post.subreddit.name}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-slate-300">?</AvatarFallback>
                  </Avatar>
                  <span className="text-slate-400 text-sm">u/deleted</span>
                </div>
              )}
            </div>

            {/* Top Right Actions - Post Management */}
            <div className="flex items-center gap-2">
              {/* Engagement Badges */}
              {engagementLevel === 'high' && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs animate-pulse">
                  🔥 Hot
                </Badge>
              )}
              {expandedView && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Eye className="w-3 h-3" />
                  <span>{viewCount.toLocaleString()}</span>
                </div>
              )}

              {/* Post Management Dropdown */}
              {ownedByCurrentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl p-2"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEdit} className="text-blue-600">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Post
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 rounded-xl p-2"
                  >
                    <Flag className="w-4 h-4" />
                  </Button>
                )
              )}
            </div>
          </div>

          <div className="flex gap-4">
            {/* Vote Section - Left Side */}
            <div className="flex flex-col items-center gap-2 pt-1">
              <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800 rounded-2xl p-2 shadow-sm">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={user ? onUpvote : () => {}}
                      disabled={!user}
                      className={`p-2 rounded-xl transition-all duration-200 ${
                        hasUpvoted
                          ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg scale-110'
                          : 'text-slate-400 hover:bg-orange-100 hover:text-orange-600 hover:scale-110'
                      } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user ? 'Upvote' : 'Sign in to vote'}</p>
                  </TooltipContent>
                </Tooltip>
                
                <span className={`text-sm font-bold py-1 transition-colors ${
                  (voteCounts?.total || 0) > 0 ? 'text-orange-600' : 
                  (voteCounts?.total || 0) < 0 ? 'text-blue-600' : 'text-slate-500'
                }`}>
                  {Math.abs(voteCounts?.total || 0) > 999 
                    ? `${((voteCounts?.total || 0) / 1000).toFixed(1)}k`
                    : (voteCounts?.total || 0)
                  }
                </span>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={user ? onDownvote : () => {}}
                      disabled={!user}
                      className={`p-2 rounded-xl transition-all duration-200 ${
                        hasDownvoted
                          ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg scale-110'
                          : 'text-slate-400 hover:bg-blue-100 hover:text-blue-600 hover:scale-110'
                      } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user ? 'Downvote' : 'Sign in to vote'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Post Title */}
              <div className="mb-4">
                {expandedView ? (
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    {post.subject}
                  </h1>
                ) : (
                  <h2 
                    className="text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-primary-600 transition-colors cursor-pointer leading-tight"
                    onClick={() => navigate(`/post/${post._id}`)}
                  >
                    {post.subject}
                  </h2>
                )}
              </div>

              {/* Post Content */}
              <div className="space-y-4 mb-6">
                {/* Text Content */}
                {post.body && (
                  <div className={`prose prose-slate dark:prose-invert max-w-none ${expandedView ? '' : 'line-clamp-3'}`}>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {post.body}
                    </p>
                  </div>
                )}

                {/* Image Content */}
                {post.imageUrl && (
                  <div className={`relative ${expandedView ? 'max-w-full' : 'max-w-sm'}`}>
                    <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 shadow-lg">
                      <img 
                        src={post.imageUrl} 
                        alt="Post content" 
                        className={`w-full object-cover cursor-pointer transition-all duration-300 hover:scale-105 ${
                          expandedView ? 'max-h-96' : 'h-48'
                        }`}
                        onClick={() => {
                          if (expandedView) {
                            setIsImageExpanded(true);
                          } else {
                            navigate(`/post/${post._id}`);
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/90 hover:bg-white text-slate-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(post.imageUrl, '_blank');
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Bar - Bottom */}
              <div className="flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-700">
                {/* Left Actions - Interaction */}
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={handleComment}
                    className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-xl px-3 py-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{commentCount || 0}</span>
                    <span className="text-sm hidden sm:inline">Comments</span>
                  </Button>

                  <DropdownMenu open={showShareMenu} onOpenChange={setShowShareMenu}>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 hover:bg-green-50 hover:text-green-600 transition-all duration-200 rounded-xl px-3 py-2"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm hidden sm:inline">Share</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuItem onClick={() => handleShare('copy')}>
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare('twitter')}>
                        Share on Twitter
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare('reddit')}>
                        Share on Reddit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Right Actions - Save */}
                <div className="flex items-center gap-1">
                  {user && (
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={toggleBookmark}
                      className={`flex items-center gap-2 transition-all duration-200 rounded-xl px-3 py-2 ${
                        isPostSaved 
                          ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' 
                          : 'hover:bg-yellow-50 hover:text-yellow-600'
                      }`}
                    >
                      {isPostSaved ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                      <span className="text-sm hidden sm:inline">
                        {isPostSaved ? 'Saved' : 'Save'}
                      </span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              {(showComments || expandedView) && (
                <div className="mt-6 space-y-6 border-t border-slate-100 dark:border-slate-700 pt-6">
                  {user && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
                      <form onSubmit={handleSubmitComment} className="space-y-4">
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="What are your thoughts?"
                          rows={3}
                          className="resize-none border-0 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 rounded-xl"
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">
                            {newComment.length}/1000 characters
                          </span>
                          <Button
                            type="submit"
                            disabled={!newComment.trim() || newComment.length > 1000}
                            size="sm"
                            className="rounded-xl"
                          >
                            Comment
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                  
                  <div className="space-y-4">
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
                    <div className="text-center">
                      <Button 
                        variant="outline"
                        onClick={() => loadMore(20)}
                        className="rounded-xl"
                      >
                        Load More Comments
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>

        {/* Image Expanded Modal */}
        {isImageExpanded && post.imageUrl && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setIsImageExpanded(false)}
          >
            <div className="relative max-w-full max-h-full">
              <img 
                src={post.imageUrl} 
                alt="Post content" 
                className="max-w-full max-h-full object-contain"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4"
                onClick={() => setIsImageExpanded(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </TooltipProvider>
  );
};

export default PostCard;