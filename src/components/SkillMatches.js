import React, { useState, useEffect, useCallback } from "react";
import "../styles/skillmatches.css";
import axios from "axios";

function SkillMatches() {
  const [searchSkill, setSearchSkill] = useState("");
  const [mySkillsWanted, setMySkillsWanted] = useState([]);
  const [matches, setMatches] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const baseURL = process.env.REACT_APP_API_BASE_URL;

  const fetchDataWithAuth = useCallback(
    async (endpoint, options = {}) => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to continue");
        return null;
      }

      try {
        const response = await axios({
          url: `${baseURL}${endpoint}`,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...options.headers,
          },
          ...options,
        });
        return response;
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          setError("Session expired. Please log in again.");
        }
        throw err;
      }
    },
    [baseURL]
  );

  const fetchMySkills = useCallback(async () => {
    setLoadingSkills(true);
    setError("");
    try {
      const response = await fetchDataWithAuth("/users/me");
      setMySkillsWanted(response?.data?.skillsWanted || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch your skills.");
    } finally {
      setLoadingSkills(false);
    }
  }, [fetchDataWithAuth]);

  const fetchMyRequests = useCallback(async () => {
    setLoadingRequests(true);
    setError("");
    try {
      const response = await fetchDataWithAuth("/match/my-requests");
      setMyRequests(response?.data?.requests || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch your match requests.");
    } finally {
      setLoadingRequests(false);
    }
  }, [fetchDataWithAuth]);

  useEffect(() => {
    fetchMySkills();
    fetchMyRequests();
  }, [fetchMySkills, fetchMyRequests]);

  const requestSession = async (teacherId, skill) => {
    try {
      setError("");
      setSuccess("");
      await fetchDataWithAuth("/sessions/create", {
        method: "POST",
        data: { teacherId, skill },
      });
      setSuccess("Session request sent successfully! 🎉");
      fetchMyRequests(); // Refresh requests list
    } catch (error) {
      console.error("Error requesting session:", error);
      setError("Failed to request session. Please try again.");
    }
  };

  const handleSearch = async () => {
    if (!searchSkill) {
      setError("Please select a skill to search");
      return;
    }
    setLoadingMatches(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetchDataWithAuth(
        `/match/search?skill=${encodeURIComponent(searchSkill)}`
      );
      setMatches(response?.data || []);
      if (response?.data?.length === 0) {
        setSuccess("No matches found for this skill");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch matches.");
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleMatch = async (teacherId) => {
    try {
      setError("");
      setSuccess("");
      await fetchDataWithAuth("/match/request", {
        method: "POST",
        data: { teacherId, skill: searchSkill },
      });
      setSuccess("Match request sent successfully!");
      await fetchMyRequests();
    } catch (err) {
      console.error(err);
      setError("Failed to send match request.");
    }
  };

  const checkRequestStatus = (teacherId) => {
    const request = myRequests.find((r) => r.teacherId === teacherId);
    return request?.status; // "pending", "approved", or undefined
  };

  const handleStartLearning = (teacherId) => {
    requestSession(teacherId, searchSkill);
  };

  return (
    <div className="skill-matches-container1">
      <h2>Find a Skill Teacher</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loadingSkills ? (
        <div className="loading-spinner">Loading your skills...</div>
      ) : (
        <div className="search-section">
          <select
            value={searchSkill}
            onChange={(e) => setSearchSkill(e.target.value)}
            disabled={loadingMatches}
          >
            <option value="">-- Select Skill to Learn --</option>
            {mySkillsWanted.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>

          <button
            onClick={handleSearch}
            disabled={!searchSkill || loadingMatches}
            className="search-button"
          >
            {loadingMatches ? (
              <>
                <span className="spinner"></span> Searching...
              </>
            ) : (
              "Search"
            )}
          </button>
        </div>
      )}

      <div className="matches-list">
        {loadingMatches ? (
          <div className="loading-spinner">Searching for teachers...</div>
        ) : matches.length > 0 ? (
          matches.map((teacher) => {
            const status = checkRequestStatus(teacher._id);

            return (
              <div key={teacher._id} className="match-card">
                <div className="teacher-info">
                  <h3>{teacher.fullName || "Unnamed Teacher"}</h3>
                  <p className="teacher-bio">
                    {teacher.bio || "No bio available."}
                  </p>
                  <p className="teacher-skills">
                    <strong>Teaches:</strong>{" "}
                    {teacher.skillsOffered?.join(", ") || "No skills listed"}
                  </p>
                </div>

                <div className="action-buttons">
                  {status === "pending" && (
                    <div className="status-badge waiting">
                      Waiting for approval
                    </div>
                  )}

                  {status === "approved" ? (
                    <button
                      className="btn start-learning"
                      onClick={() => handleStartLearning(teacher._id)}
                    >
                      Start Learning Session
                    </button>
                  ) : (
                    !status && (
                      <button
                        className="btn match"
                        onClick={() => handleMatch(teacher._id)}
                        disabled={loadingRequests}
                      >
                        {loadingRequests ? "Processing..." : "Request Match"}
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })
        ) : (
          !loadingMatches && (
            <div className="no-results">
              {searchSkill
                ? "No teachers found for this skill. Try another search!"
                : "Select a skill you want to learn and click Search"}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default SkillMatches;
