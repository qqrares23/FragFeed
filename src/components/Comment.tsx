import { Id } from "../../convex/_generated/dataModel";
import { Link } from "react-router-dom";

interface CommentProps {
  comment: {
    _id: Id<"comments">;
    content: string;
    author?: {
      username?: string;
    };
    _creationTime: number;
  };
}

const Comment = ({ comment }: CommentProps) => {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
        {comment.author?.username ? (
          <Link 
            to={`/u/${comment.author.username}`} 
            className="font-medium text-slate-700 hover:text-primary-600"
          >
            u/{comment.author.username}
          </Link>
        ) : (
          <span className="text-slate-400">deleted</span>
        )}
        <span>•</span>
        <span>{new Date(comment._creationTime).toLocaleDateString()}</span>
      </div>
      <div className="text-slate-900 whitespace-pre-wrap">
        {comment.content}
      </div>
    </div>
  );
};

export default Comment;