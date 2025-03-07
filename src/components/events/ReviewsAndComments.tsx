import React, { useState } from "react";
import { User, Star, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

interface Comment {
  id: string;
  userName: string;
  userAvatar?: string;
  text: string;
  date: string;
}

interface ReviewsAndCommentsProps {
  eventId?: string;
  reviews?: Review[];
  comments?: Comment[];
  onAddReview?: (review: Omit<Review, "id" | "date">) => void;
  onAddComment?: (comment: Omit<Comment, "id" | "date">) => void;
}

const ReviewsAndComments = ({
  eventId = "1",
  reviews = [
    {
      id: "1",
      userName: "Sarah Johnson",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      rating: 5,
      comment: "Great event! Very well organized and the route was beautiful.",
      date: "2023-05-15",
    },
    {
      id: "2",
      userName: "Michael Chen",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      rating: 4,
      comment:
        "Enjoyed the run, though water stations could have been better placed.",
      date: "2023-05-14",
    },
    {
      id: "3",
      userName: "Emma Wilson",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
      rating: 5,
      comment: "Amazing atmosphere and great support from volunteers!",
      date: "2023-05-13",
    },
  ],
  comments = [
    {
      id: "1",
      userName: "David Miller",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      text: "Is there a bag check available at the start line?",
      date: "2023-05-10",
    },
    {
      id: "2",
      userName: "Jessica Lee",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
      text: "What time does packet pickup start?",
      date: "2023-05-09",
    },
    {
      id: "3",
      userName: "Event Organizer",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Organizer",
      text: "Yes, there will be a bag check at the start line. Packet pickup starts at 6:00 AM on race day or you can pick up the day before at the expo from 10 AM to 6 PM.",
      date: "2023-05-10",
    },
  ],
  onAddReview = () => {},
  onAddComment = () => {},
}: ReviewsAndCommentsProps) => {
  const [newComment, setNewComment] = useState("");
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [activeTab, setActiveTab] = useState<"reviews" | "comments">("reviews");

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment({
        userName: "You",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
        text: newComment,
      });
      setNewComment("");
    }
  };

  const handleAddReview = () => {
    if (newReview.trim()) {
      onAddReview({
        userName: "You",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
        rating: newRating,
        comment: newReview,
      });
      setNewReview("");
      setNewRating(5);
    }
  };

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        />
      ));
  };

  const renderRatingSelector = () => {
    return (
      <div className="flex items-center gap-1 mb-2">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 cursor-pointer ${i < newRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
              onClick={() => setNewRating(i + 1)}
            />
          ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
      <div className="flex border-b mb-4">
        <button
          className={`pb-2 px-4 ${activeTab === "reviews" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500"}`}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews
        </button>
        <button
          className={`pb-2 px-4 ${activeTab === "comments" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500"}`}
          onClick={() => setActiveTab("comments")}
        >
          Questions & Comments
        </button>
      </div>

      {activeTab === "reviews" ? (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Event Reviews</h3>

          {/* Add a review */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Add Your Review</h4>
            {renderRatingSelector()}
            <Textarea
              placeholder="Share your experience..."
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              className="min-h-[100px] mb-2"
            />
            <Button
              onClick={handleAddReview}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Submit Review
            </Button>
          </div>

          {/* Reviews list */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={review.userAvatar}
                      alt={review.userName}
                    />
                    <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{review.userName}</div>
                    <div className="text-xs text-gray-500">{review.date}</div>
                  </div>
                </div>
                <div className="flex mb-2">{renderStars(review.rating)}</div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Questions & Comments</h3>

          {/* Add a comment */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Ask a Question</h4>
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask about the event..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] flex-1"
              />
              <Button
                onClick={handleAddComment}
                className="self-end bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Comments list */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={comment.userAvatar}
                      alt={comment.userName}
                    />
                    <AvatarFallback>
                      {comment.userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{comment.userName}</div>
                    <div className="text-xs text-gray-500">{comment.date}</div>
                  </div>
                </div>
                <p className="text-gray-700">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsAndComments;
