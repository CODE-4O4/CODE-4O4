import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  submitJoinRequest,
  registerProjectInterest,
  rsvpToEvent,
} from "./firestore";
import type { JoinRequestPayload, ActionResult } from "@/types";


const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("firestore API functions", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("registerProjectInterest", () => {
    it("should successfully register project interest", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, message: "Project lead notified." }),
      });

      const result = await registerProjectInterest("project-123", "user-456");

      expect(mockFetch).toHaveBeenCalledWith("/api/project-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: "project-123", userId: "user-456" }),
      });

      expect(result).toEqual({
        ok: true,
        message: "Project lead notified.",
      });
    });

    it("should handle API error response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          ok: false,
          message: "Missing project or user id",
        }),
      });

      const result = await registerProjectInterest("", "user-456");

      expect(result).toEqual({
        ok: false,
        message: "Missing project or user id",
        error: undefined,
      });
    });

    it("should handle network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      const result = await registerProjectInterest("project-123", "user-456");

      expect(result).toEqual({
        ok: false,
        message: "Network error. Please retry.",
        error: "Error: Network failure",
      });
    });
  });

  describe("rsvpToEvent", () => {
    it("should successfully RSVP to event", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, message: "RSVP confirmed." }),
      });

      const result = await rsvpToEvent("event-789", "user-456");

      expect(mockFetch).toHaveBeenCalledWith("/api/event-rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: "event-789", userId: "user-456" }),
      });

      expect(result).toEqual({
        ok: true,
        message: "RSVP confirmed.",
      });
    });

    it("should handle missing event or user ID", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          ok: false,
          message: "Missing event or user id",
        }),
      });

      const result = await rsvpToEvent("", "");

      expect(result).toEqual({
        ok: false,
        message: "Missing event or user id",
        error: undefined,
      });
    });

    it("should handle network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Connection timeout"));

      const result = await rsvpToEvent("event-789", "user-456");

      expect(result).toEqual({
        ok: false,
        message: "Network error. Please retry.",
        error: "Error: Connection timeout",
      });
    });
  });

  describe("submitJoinRequest", () => {
    it("should successfully submit join request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, message: "Request received." }),
      });

      const payload: JoinRequestPayload = {
        displayName: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        github: "johndoe",
        portfolio: "https://johndoe.dev",
        interests: ["Web Development", "AI"],
        experience: "beginner",
        goals: "I want to learn and contribute to open source",
        role: "student",
        availability: "Weekends and evenings",
      };

      const result = await submitJoinRequest(payload);

      expect(mockFetch).toHaveBeenCalledWith("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(result).toEqual({
        ok: true,
        message: "Request received.",
      });
    });

    it("should handle validation error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          ok: false,
          message: "Invalid payload",
          error: "Missing required fields",
        }),
      });

      const incompletePayload = {
        displayName: "John Doe",
      } as unknown as JoinRequestPayload;

      const result = await submitJoinRequest(incompletePayload);

      expect(result).toEqual({
        ok: false,
        message: "Invalid payload",
        error: "Missing required fields",
      });
    });
  });

  describe("edge cases and error scenarios", () => {
    it("should handle server 500 error gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          ok: false,
          message: "Unable to save interest.",
          error: "Database connection failed",
        }),
      });

      const result = await registerProjectInterest("project-123", "user-456");

      expect(result.ok).toBe(false);
      expect(result.message).toBe("Unable to save interest.");
    });

    it("should handle malformed JSON response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      const result = await registerProjectInterest("project-123", "user-456");

      expect(result.ok).toBe(false);
      expect(result.message).toBe("Network error. Please retry.");
    });

    it("should handle empty response body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await registerProjectInterest("project-123", "user-456");

      expect(result.ok).toBe(false);
      expect(result.message).toBe("Request failed");
    });
  });

  describe("concurrent requests", () => {
    it("should handle multiple simultaneous project interests", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, message: "Project lead notified." }),
      });

      const results = await Promise.all([
        registerProjectInterest("project-1", "user-1"),
        registerProjectInterest("project-2", "user-1"),
        registerProjectInterest("project-3", "user-1"),
      ]);

      expect(results).toHaveLength(3);
      results.forEach((result: ActionResult) => {
        expect(result.ok).toBe(true);
        expect(result.message).toBe("Project lead notified.");
      });

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("should handle mixed success and failure responses", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true, message: "RSVP confirmed." }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ ok: false, message: "Event is full" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true, message: "RSVP confirmed." }),
        });

      const results = await Promise.all([
        rsvpToEvent("event-1", "user-1"),
        rsvpToEvent("event-2", "user-1"),
        rsvpToEvent("event-3", "user-1"),
      ]);

      expect(results[0].ok).toBe(true);
      expect(results[1].ok).toBe(false);
      expect(results[2].ok).toBe(true);
    });
  });
});
