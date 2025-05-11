"use client";

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getSessionById,
  proposeTimeSlot,
  voteForTimeSlot,
  finalizeTimeSlot,
  submitFeedback,
} from "../services/sessionService";

function SessionDetail() {
  const { sessionId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Time slot proposal state
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalDate, setProposalDate] = useState("");
  const [proposalStartTime, setProposalStartTime] = useState("");
  const [proposalEndTime, setProposalEndTime] = useState("");
  const [proposalLocation, setProposalLocation] = useState("");

  // Feedback state
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");

  useEffect(() => {
    async function fetchSession() {
      try {
        const sessionData = await getSessionById(sessionId);
        setSession(sessionData);
      } catch (error) {
        setError("Failed to load session details.");
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [sessionId]);

  const handleProposeTimeSlot = async (e) => {
    e.preventDefault();

    if (!proposalDate || !proposalStartTime || !proposalEndTime) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      const startDateTime = new Date(`${proposalDate}T${proposalStartTime}`);
      const endDateTime = new Date(`${proposalDate}T${proposalEndTime}`);

      if (endDateTime <= startDateTime) {
        setError("End time must be after start time.");
        setLoading(false);
        return;
      }

      const timeSlot = {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        location: proposalLocation,
      };

      await proposeTimeSlot(sessionId, timeSlot);

      // Refresh session data
      const updatedSession = await getSessionById(sessionId);
      setSession(updatedSession);

      // Reset form
      setShowProposalForm(false);
      setProposalDate("");
      setProposalStartTime("");
      setProposalEndTime("");
      setProposalLocation("");
      setError("");
    } catch (error) {
      setError("Failed to propose time slot. Please try again.");
      console.error("Error proposing time slot:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (timeSlotId) => {
    try {
      setLoading(true);
      await voteForTimeSlot(sessionId, timeSlotId);

      // Refresh session data
      const updatedSession = await getSessionById(sessionId);
      setSession(updatedSession);
    } catch (error) {
      setError("Failed to submit vote. Please try again.");
      console.error("Error voting for time slot:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeTimeSlot = async (timeSlotId) => {
    try {
      setLoading(true);
      await finalizeTimeSlot(sessionId, timeSlotId);

      // Refresh session data
      const updatedSession = await getSessionById(sessionId);
      setSession(updatedSession);
    } catch (error) {
      setError("Failed to finalize time slot. Please try again.");
      console.error("Error finalizing time slot:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const feedback = {
        rating: feedbackRating,
        comment: feedbackComment,
      };

      await submitFeedback(sessionId, feedback);

      // Refresh session data
      const updatedSession = await getSessionById(sessionId);
      setSession(updatedSession);

      // Reset form
      setShowFeedbackForm(false);
      setFeedbackRating(5);
      setFeedbackComment("");
    } catch (error) {
      setError("Failed to submit feedback. Please try again.");
      console.error("Error submitting feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const isHost = session && session.host._id === currentUser._id;
  const sessionEnded =
    session &&
    session.finalizedSlot &&
    new Date(session.finalizedSlot.endTime) < new Date();
  const hasVoted = (timeSlot) =>
    timeSlot.votes.some((vote) => vote.user === currentUser._id);

  if (loading && !session) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
          <button
            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => navigate("/")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {session.title}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {session.subject && `Subject: ${session.subject}`}
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to={`/resources/${sessionId}`}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Resources
              </Link>
              {session.finalizedSlot && (
                <button
                  onClick={() =>
                    window.open(
                      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                        session.title
                      )}&dates=${encodeURIComponent(
                        new Date(session.finalizedSlot.startTime)
                          .toISOString()
                          .replace(/-|:|\.\d+/g, "")
                      )}/${encodeURIComponent(
                        new Date(session.finalizedSlot.endTime)
                          .toISOString()
                          .replace(/-|:|\.\d+/g, "")
                      )}${
                        session.finalizedSlot.location
                          ? `&location=${encodeURIComponent(
                              session.finalizedSlot.location
                            )}`
                          : ""
                      }&details=${encodeURIComponent(
                        session.description || ""
                      )}`,
                      "_blank"
                    )
                  }
                  className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Add to Google Calendar
                </button>
              )}
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Description
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {session.description || "No description provided."}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Host</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {session.host.name} ({session.host.email})
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(session.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Participants
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {session.participants.map((participant) => (
                      <li
                        key={participant._id}
                        className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                      >
                        <div className="w-0 flex-1 flex items-center">
                          <span className="ml-2 flex-1 w-0 truncate">
                            {participant.name} ({participant.email})
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {session.finalizedSlot ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Confirmed Time
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                This session has been scheduled.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(
                      session.finalizedSlot.startTime
                    ).toLocaleDateString()}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Time</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(
                      session.finalizedSlot.startTime
                    ).toLocaleTimeString()}{" "}
                    -{" "}
                    {new Date(
                      session.finalizedSlot.endTime
                    ).toLocaleTimeString()}
                  </dd>
                </div>
                {session.finalizedSlot.location && (
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Location
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {session.finalizedSlot.location}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Proposed Time Slots
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Vote for your preferred time or propose a new one.
                </p>
              </div>
              <button
                onClick={() => setShowProposalForm(!showProposalForm)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {showProposalForm ? "Cancel" : "Propose Time Slot"}
              </button>
            </div>

            {showProposalForm && (
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <form onSubmit={handleProposeTimeSlot} className="space-y-4">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="proposal-date"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Date
                      </label>
                      <div className="mt-1">
                        <input
                          type="date"
                          id="proposal-date"
                          value={proposalDate}
                          onChange={(e) => setProposalDate(e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="proposal-location"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Location (optional)
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="proposal-location"
                          value={proposalLocation}
                          onChange={(e) => setProposalLocation(e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="e.g., Library, Room 101, Zoom, etc."
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="proposal-start-time"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Start Time
                      </label>
                      <div className="mt-1">
                        <input
                          type="time"
                          id="proposal-start-time"
                          value={proposalStartTime}
                          onChange={(e) => setProposalStartTime(e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="proposal-end-time"
                        className="block text-sm font-medium text-gray-700"
                      >
                        End Time
                      </label>
                      <div className="mt-1">
                        <input
                          type="time"
                          id="proposal-end-time"
                          value={proposalEndTime}
                          onChange={(e) => setProposalEndTime(e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {loading ? "Submitting..." : "Submit Proposal"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="border-t border-gray-200">
              {session.timeSlots.length === 0 ? (
                <div className="px-4 py-5 sm:px-6 text-center">
                  <p className="text-sm text-gray-500">
                    No time slots have been proposed yet.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {session.timeSlots.map((timeSlot) => {
                    const voteCount = timeSlot.votes.length;

                    return (
                      <li key={timeSlot._id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(
                                timeSlot.startTime
                              ).toLocaleDateString()}{" "}
                              from{" "}
                              {new Date(
                                timeSlot.startTime
                              ).toLocaleTimeString()}{" "}
                              to{" "}
                              {new Date(timeSlot.endTime).toLocaleTimeString()}
                            </p>
                            {timeSlot.location && (
                              <p className="text-sm text-gray-500">
                                Location: {timeSlot.location}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {voteCount} {voteCount === 1 ? "vote" : "votes"}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleVote(timeSlot._id)}
                              disabled={loading || hasVoted(timeSlot)}
                              className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                hasVoted(timeSlot)
                                  ? "text-white bg-green-600"
                                  : "text-white bg-indigo-600 hover:bg-indigo-700"
                              }`}
                            >
                              {hasVoted(timeSlot) ? "Voted" : "Vote"}
                            </button>

                            {isHost && (
                              <button
                                onClick={() =>
                                  handleFinalizeTimeSlot(timeSlot._id)
                                }
                                disabled={loading}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Finalize
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        {sessionEnded && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Session Feedback
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Share your thoughts about this study session.
                </p>
              </div>
              {!showFeedbackForm && (
                <button
                  onClick={() => setShowFeedbackForm(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Leave Feedback
                </button>
              )}
            </div>

            {showFeedbackForm && (
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  <div>
                    <label
                      htmlFor="rating"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Rating (1-5)
                    </label>
                    <div className="mt-1 flex items-center">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFeedbackRating(rating)}
                          className={`mx-1 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                            feedbackRating >= rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="comment"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Comments
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="comment"
                        rows={3}
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Share your thoughts about this study session..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowFeedbackForm(false)}
                      className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {loading ? "Submitting..." : "Submit Feedback"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {session.feedback && session.feedback.length > 0 && (
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {session.feedback.map((feedback) => (
                    <li key={feedback._id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-5 w-5 ${
                                  feedback.rating >= star
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {feedback.user.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </p>
                          {feedback.comment && (
                            <p className="mt-2 text-sm text-gray-700">
                              {feedback.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionDetail;
