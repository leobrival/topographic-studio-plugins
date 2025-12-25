/**
 * Types for hookify rule engine
 */

export interface Condition {
	field: string;
	operator: "regex_match" | "contains" | "equals" | "not_contains" | "starts_with" | "ends_with";
	pattern: string;
}

export interface Rule {
	name: string;
	enabled: boolean;
	event: "bash" | "file" | "stop" | "prompt" | "all";
	pattern?: string;
	conditions: Condition[];
	action: "warn" | "block";
	tool_matcher?: string;
	message: string;
}

export interface HookInput {
	hook_event_name?: string;
	tool_name?: string;
	tool_input?: Record<string, unknown>;
	reason?: string;
	transcript_path?: string;
	user_prompt?: string;
}

export interface HookOutput {
	decision?: "block";
	reason?: string;
	systemMessage?: string;
	hookSpecificOutput?: {
		hookEventName: string;
		permissionDecision: "deny" | "allow";
	};
}
