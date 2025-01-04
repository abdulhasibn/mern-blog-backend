import Comment from "../models/comment.model.js";
import { errorHandler } from "../utils/error.js";
import mongoose from "mongoose";

export const createComment = async (req, res, next) => {
  try {
    const { content, userId, postId } = req.body;
    if (!content || !userId || !postId) {
      return next(errorHandler(400, "All fields are required"));
    }
    const newComment = new Comment({
      content,
      userId,
      postId,
    });
    await newComment.save();
    res.status(201).json({ newComment });
  } catch (error) {
    next(error);
  }
};

export const getAllComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      return next(errorHandler(400, "postId Is required"));
    }

    const getAllCommentsPipeline = [
      {
        $match: {
          postId: new mongoose.Types.ObjectId(postId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          username: "$userDetails.username",
          userId: 1,
          imgUrl: "$userDetails.profilePicture",
          postId: 1,
          createdAt: 1,
          numberOfLikes: 1,
          content: 1,
          isLiked: {
            $cond: {
              if: { $in: ["$userId", "$likes"] },
              then: true,
              else: false,
            },
          },
        },
      },
    ];
    const commentData = await Comment.aggregate(getAllCommentsPipeline);
    res.status(200).json(commentData);
  } catch (error) {
    return next(error);
  }
};

export const updateLikeForComment = async (req, res, next) => {
  try {
    const { userId, commentId } = req.query;
    if (!userId || !commentId) {
      return next(errorHandler(400, "All fields are required"));
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(errorHandler(404, "Comment not found"));
    }

    const userIdObject = new mongoose.Types.ObjectId(userId);
    const userIndex = comment.likes.indexOf(userIdObject);

    let updatedComment;
    if (userIndex === -1) {
      // User ID not found in likes array, add it and increment likes count
      updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
          $push: { likes: userIdObject },
          $inc: { numberOfLikes: 1 },
        },
        { new: true }
      );
    } else {
      // User ID found in likes array, remove it and decrement likes count
      updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
          $pull: { likes: userIdObject },
          $inc: { numberOfLikes: -1 },
        },
        { new: true }
      );
    }

    if (!updatedComment) {
      return next(errorHandler(500, "Something went wrong"));
    }

    res.status(200).json(updatedComment);
  } catch (error) {
    next(error);
  }
};

export const editComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return next(errorHandler(400, "Content is required"));
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true }
    );

    if (!updatedComment) {
      return next(errorHandler(404, "Comment not found"));
    }

    res.status(200).json(updatedComment);
  } catch (error) {
    return next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    if (!commentId) {
      return next(errorHandler(400, "Comment ID is required"));
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (!deletedComment) {
      return next(errorHandler(404, "Comment not found"));
    }

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    return next(error);
  }
};
