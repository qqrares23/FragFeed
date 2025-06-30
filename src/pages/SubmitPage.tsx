import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Image, AlertTriangle } from "lucide-react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SubmitPage = () => {
  const { subredditName } = useParams();
  const navigate = useNavigate();
  const subreddit = useQuery(api.subreddit.get, { name: subredditName || "" });
  const isMember = useQuery(api.subreddit.isMember, 
    subreddit ? { subredditId: subreddit._id } : "skip"
  );

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPost = useMutation(api.post.create);
  const generateUploadUrl = useMutation(api.image.generateUploadUrl);

  if (subreddit === undefined) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!subreddit) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Community not found</h1>
          <p className="text-slate-600">The community r/{subredditName} does not exist.</p>
        </div>
      </div>
    );
  }

  if (isMember === false) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <Card className="p-12 text-center max-w-md">
          <CardContent>
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Membership Required</h1>
            <p className="text-slate-600 mb-6">
              You must join r/{subredditName} before you can create posts.
            </p>
            <Button 
              onClick={() => navigate(`/r/${subredditName}`)}
              className="w-full"
            >
              Go to r/{subredditName}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subreddit) {
      alert("Please enter a title");
      return;
    }

    try {
      setIsSubmitting(true);
      let imageUrl = undefined;

      if (selectedImage) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: {"Content-Type": selectedImage.type},
          body: selectedImage
        });

        if (!result.ok) throw new Error('Failed to upload image.');

        const {storageId} = await result.json();
        imageUrl = storageId;
      }
      
      await createPost({
        subject: title.trim(),
        body: body.trim(),
        subreddit: subreddit._id,
        storageId: imageUrl
      });
      navigate(`/r/${subredditName}`);
    } catch (error: any) {
      console.log(error);
      if (error.data?.message === "You must join this subreddit before posting") {
        alert("You must join this subreddit before posting. Redirecting...");
        navigate(`/r/${subredditName}`);
      } else {
        alert("Failed to create post. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="p-8">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-2xl font-bold text-slate-900">
              Create a post in r/{subredditName}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                  Title
                </Label>
                <Input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="An interesting title"
                  maxLength={100}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label className="block text-sm font-semibold text-slate-700 mb-2">
                  Image (optional)
                </Label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6">
                  <label className="cursor-pointer">
                    <Button type="button" variant="secondary" className="pointer-events-none">
                      <Image className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                  </label>
                  
                  {imagePreview && (
                    <div className="mt-4 relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-full max-h-64 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="body" className="block text-sm font-semibold text-slate-700 mb-2">
                  Text (optional)
                </Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={6}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  onClick={() => navigate(`/r/${subredditName}`)}
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting || !title.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Posting...
                    </>
                  ) : (
                    "Post"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubmitPage;