import { Id } from "../../convex/_generated/dataModel";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CommentProps {
  comment: {
    _id: Id<"comments">;
    content: string;
    author?: {
      username?: string;
    };
    _creationTime: number;
  };
  canDelete?: boolean;
  onDelete?: () => void;
}

const Comment = ({ comment, canDelete = false, onDelete }: CommentProps) => {
  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardContent className="p-3 lg:p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs lg:text-sm text-slate-500">
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
          
          {canDelete && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
        <div className="text-slate-900 whitespace-pre-wrap text-sm lg:text-base">
          {comment.content}
        </div>
      </CardContent>
    </Card>
  );
};

export default Comment;