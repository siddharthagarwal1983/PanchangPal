# DESIGN_CONTEXT.md

# PanchangPal — Design Context

**Version:** 1.0.0
**Status:** Living Document
**Owner:** Product Design

---

# Purpose

This document defines the design philosophy, interaction principles, visual language, accessibility standards, and user experience rules for PanchangPal.

It is intended for:

* Product Designers
* UX Designers
* UI Designers
* Frontend Engineers
* AI Coding Agents
* QA Engineers

This document explains **how PanchangPal should feel**, not merely how it should look.

The detailed component specifications remain in the Product Design Document (PDD) Part 3 and the Design System.

---

# Design Philosophy

PanchangPal is not designed to maximize screen time.

It is designed to maximize:

* Trust
* Clarity
* Completion
* Understanding
* Habit Formation
* Family Participation

Every screen should answer one question:

> **"Does this make today's spiritual practice easier?"**

If the answer is "No", redesign it.

---

# Design Principles

Every design decision should reinforce these principles.

## 1. Calm Over Noise

The interface should feel peaceful.

Avoid:

* Flashing animations
* Bright promotional banners
* Excessive badges
* Visual clutter
* Aggressive CTAs

Prefer:

* White space
* Gentle hierarchy
* Soft transitions
* Clear typography

---

## 2. Trust Before Beauty

Beautiful interfaces are valuable.

Trusted interfaces are essential.

Never hide:

* Sources
* Errors
* Limitations
* Uncertainty

The user should always understand where information comes from.

---

## 3. Simplicity Wins

One clear action per screen.

Avoid:

* Multiple competing CTAs
* Complex forms
* Nested navigation
* Unnecessary configuration

Every interaction should reduce cognitive load.

---

## 4. Respect Tradition

Technology should support tradition.

It should never replace it.

The application explains traditions.

It does not redefine them.

---

## 5. Family First

Whenever appropriate:

Design for households instead of individuals.

Encourage:

* Shared rituals
* Shared reminders
* Shared celebrations

---

# Emotional Design Goals

Users should feel:

* Calm
* Confident
* Guided
* Welcome
* Encouraged
* Connected

Users should never feel:

* Judged
* Guilty
* Rushed
* Manipulated
* Confused

---

# User Experience Principles

Every interaction should be:

* Predictable
* Accessible
* Fast
* Forgiving
* Recoverable

The interface should never surprise the user unnecessarily.

---

# Navigation Principles

Navigation should remain shallow.

Users should reach any major destination within:

**Three interactions or fewer.**

Bottom navigation remains the primary navigation mechanism.

Never introduce hidden navigation patterns without design approval.

---

# Information Hierarchy

Every screen should communicate information in this order:

1. Purpose
2. Primary Action
3. Supporting Context
4. Optional Actions
5. Secondary Information

Never overwhelm users with too much information above the fold.

---

# Component Philosophy

Always reuse existing components.

Never duplicate functionality.

Before creating a component:

1. Search the Component Library.
2. Search existing variants.
3. Extend when possible.
4. Create new components only when necessary.

The Component Library is the single source of truth.

---

# Visual Language

The visual language should communicate:

* Warmth
* Clarity
* Authenticity
* Simplicity

Avoid visual styles associated with:

* Gaming
* E-commerce
* Social media
* Financial trading
* News feeds

---

# Typography Principles

Typography should prioritize readability.

Hierarchy should be established through:

* Size
* Weight
* Spacing

Avoid excessive font variations.

Support Dynamic Type across the application.

---

# Color Philosophy

Colors communicate meaning.

Primary colors should reinforce:

* Trust
* Calm
* Spiritual warmth

Never rely on color alone to communicate status.

Every status must also include:

* Icon
* Label
* Accessibility hint

---

# Motion Principles

Motion exists to explain.

Never animate for decoration alone.

Animations should:

* Guide attention
* Confirm actions
* Reduce uncertainty
* Improve continuity

Animations must:

* Respect Reduced Motion settings
* Complete quickly
* Never block user interaction

---

# Feedback Principles

Every user action should receive feedback.

Examples:

* Tap acknowledgement
* Loading state
* Success confirmation
* Error recovery
* Retry guidance

Users should never wonder if an action succeeded.

---

# Loading States

Every asynchronous action requires:

* Skeleton state
* Loading indicator
* Timeout handling
* Retry option (where appropriate)

Avoid blank screens.

---

# Empty States

Empty states should educate.

Every empty state should include:

* Explanation
* Illustration (if appropriate)
* Recommended next action

Never leave users at a dead end.

---

# Error Design

Errors should:

* Explain what happened
* Explain what the user can do next
* Avoid technical language

Never blame the user.

Example:

Instead of:

"Unknown Error"

Use:

"We couldn't load today's Panchang. Please try again."

---

# Accessibility Principles

Accessibility is mandatory.

Every screen must support:

* VoiceOver
* TalkBack
* Dynamic Type
* WCAG AA contrast
* Minimum 44×44 touch targets
* Keyboard navigation (where applicable)
* Screen reader labels
* Reduced Motion

Accessibility should be built into the design process—not added afterward.

---

# AI Experience Principles

Ask Guru should feel like:

* A knowledgeable guide
* Calm
* Honest
* Respectful

It should never feel like:

* A chatbot trying to impress
* A search engine
* An opinion generator

If the AI is uncertain, it should say so clearly.

---

# Notification Experience

Notifications should be:

* Helpful
* Timely
* Respectful

Never use:

* Fear
* Guilt
* Artificial urgency
* Clickbait

Users should always feel comfortable disabling notifications without losing core functionality.

---

# Content Presentation

Present information progressively.

Start with:

* Essential information

Allow users to expand for:

* Details
* Background
* References
* Sources

Avoid overwhelming new users.

---

# Localization Principles

Design should support:

* Multiple languages
* Long text expansion
* RTL layouts
* Regional festival variations
* Local time zones

Avoid layouts that depend on fixed text lengths.

---

# Inclusive Design

Design for:

* Beginners
* Elderly users
* Busy professionals
* Parents
* Users with accessibility needs

Never assume prior religious knowledge.

---

# Design Tokens

All visual properties must reference approved design tokens.

Never hard-code:

* Colors
* Typography
* Spacing
* Elevation
* Border radius
* Motion values

The Design System is the source of truth.

---

# Design System Governance

Every reusable component must include:

* Version
* Purpose
* Variants
* States
* Accessibility
* Tokens
* Dependencies
* Ownership
* Test Coverage

Do not modify shared components without updating their version history.

---

# UX Copy Principles

Copy should be:

* Friendly
* Respectful
* Clear
* Concise

Avoid:

* Marketing language
* Religious superiority
* Technical jargon
* Fear-based messaging

The interface should sound like a trusted guide.

---

# AI Coding Agent Guidance

When implementing UI:

* Follow the PDD before making design decisions.
* Use existing components.
* Preserve screen layouts.
* Respect interaction patterns.
* Use approved design tokens.
* Maintain accessibility.
* Never introduce new visual patterns without approval.

If a design requirement is unclear:

Stop.

Request clarification.

Do not invent UI behavior.

---

# Definition of Design Success

A design is successful when users can:

* Understand what to do immediately.
* Complete their task without confusion.
* Trust the information presented.
* Feel calm while using the application.
* Return daily because the experience is genuinely valuable.

Every design decision should reinforce these outcomes.

---

# Design Review Checklist

Before approving any new screen or component, verify:

* ✓ Aligns with product principles
* ✓ Uses existing design tokens
* ✓ Reuses existing components where possible
* ✓ Meets accessibility standards
* ✓ Includes loading, empty, and error states
* ✓ Supports offline scenarios where applicable
* ✓ Uses approved UX copy
* ✓ Has analytics instrumentation defined
* ✓ Meets performance expectations
* ✓ Maintains consistency with the Design System

No design should proceed to implementation until this checklist is complete.
