# AI Enterprise Procurement Platform

## Project Overview

Build a production-grade, enterprise-level AI Procurement Platform that enables organizations to manage procurement requests, vendors, approvals, contracts, and AI-powered document analysis.

The project should be written as if it will be deployed to production and used by large enterprises.

---

# Tech Stack

## Backend

- NestJS 11
- TypeScript
- PostgreSQL
- Prisma ORM
- Docker
- JWT Authentication
- Passport
- Swagger
- Zod
- Argon2
- Redis (later)
- BullMQ (later)

## Frontend

- React Native
- Expo
- TypeScript
- React Query (TanStack Query)
- Expo Router
- NativeWind
- React Hook Form
- Zod

---

# Architecture

Use enterprise architecture.

Requirements:

- SOLID Principles
- Repository Pattern
- Dependency Injection
- DTO Validation
- Feature-based modules
- Strong typing
- Reusable services
- Modular design
- Production-ready code

Never generate quick hacks.

Never generate placeholder code unless explicitly requested.

---

# Folder Structure

Backend

```
src/

auth/

users/

organisations/

vendors/

procurement/

contracts/

documents/

ai/

notifications/

audit/

payments/

database/

common/

config/
```

---

# Coding Standards

Always

- Use DTOs
- Use ValidationPipe
- Use class-validator
- Use Swagger decorators
- Use async/await
- Use dependency injection
- Use Repository Pattern
- Use Prisma Service
- Use services instead of direct database access
- Return clean API responses
- Handle errors properly

Never

- Access Prisma directly from controllers
- Put business logic inside controllers
- Duplicate code
- Use any unless absolutely unavoidable

---

# Authentication

Implement

- Registration
- Login
- JWT Access Tokens
- JWT Refresh Tokens
- Logout
- Refresh Token Rotation
- Password Reset
- Email Verification

Security

- Passport JWT
- Argon2 Password Hashing
- Guards
- Decorators

---

# Authorization

Implement RBAC.

Roles

- SUPER_ADMIN
- ADMIN
- PROCUREMENT_MANAGER
- FINANCE
- DEPARTMENT_HEAD
- APPROVER
- VENDOR
- USER

Create

- Roles Decorator
- Roles Guard
- CurrentUser Decorator

Protect endpoints.

---

# Organisations

Implement

- Create Organisation
- Update Organisation
- Delete Organisation
- View Organisation
- Invite Members
- Remove Members
- Organisation Ownership

Relationships

Organisation

↓

Users

↓

Procurement

↓

Vendors

---

# Users

Implement

- Profile
- Update Profile
- Change Password
- Upload Avatar
- List Users
- Search Users

---

# Vendor Management

Vendor

Fields

- Name
- Email
- Phone
- Address
- Category
- Status
- Rating
- Compliance Status

Features

- CRUD
- Search
- Archive
- Activate
- Vendor Performance

---

# Procurement Module

Statuses

- Draft
- Submitted
- Pending Approval
- Approved
- Rejected
- Cancelled

Features

- Create Request
- Update Request
- Delete Draft
- Submit
- Approval Workflow
- Comments
- Attachments
- Budget Validation

---

# Approval Workflow

Levels

Department Head

↓

Procurement

↓

Finance

↓

Executive Approval

Track

- Approved By
- Rejected By
- Comments
- Dates

---

# Contracts

CRUD

Upload PDFs

Store metadata

Expiration reminders

Renewals

Versioning

---

# AI Module

Integrate OpenAI.

Capabilities

- Contract Summary
- Clause Extraction
- Risk Detection
- Procurement Recommendation
- Vendor Risk Analysis
- Compliance Analysis
- Chat with Procurement Documents

Future

Claude integration

---

# Documents

Support

- PDF
- DOCX
- XLSX

Storage

- AWS S3

Features

- Upload
- Download
- Preview
- Signed URLs

---

# Notifications

Channels

- Email
- Push
- In-App

Events

- Approval
- Rejection
- Invitation
- Password Reset
- Contract Expiry

---

# Audit Logs

Log every important action.

Examples

- Login
- Logout
- Vendor Created
- Procurement Submitted
- Approval
- Password Changed
- User Invited

---

# Dashboard

Statistics

- Total Vendors
- Total Procurement Requests
- Pending Approvals
- Spend Analysis
- Monthly Spend
- Vendor Performance

---

# Payments

Paystack

Plans

- Free
- Professional
- Enterprise

Features

- Subscription
- Billing
- Invoice
- Webhooks

---

# Mobile App

Authentication

Dashboard

Notifications

Approvals

Profile

Vendor Search

Procurement Requests

Offline support (future)

---

# Testing

Write

- Unit Tests
- Integration Tests
- E2E Tests

Coverage

Minimum

80%

---

# CI/CD

GitHub Actions

Docker

Production Build

Deployment

---

# Documentation

Swagger

README

Environment Variables

Deployment Guide

Architecture Diagram

---

# Development Workflow

IMPORTANT

Never implement multiple sprints at once.

Complete ONE sprint.

Stop.

Wait for my confirmation.

---

# After Every Sprint

Generate the following.

## Summary

Explain what was completed.

---

## Files

List

Created

Modified

Deleted

---

## Testing

Explain exactly how to test the feature.

---

## Branch Name

Example

```
feature/auth-jwt
```

---

## Commit Command

Always generate ONE command.

Example

```bash
git add . && git commit -m "feat(auth): implement JWT authentication" \
-m "Implement Passport JWT strategy." \
-m "Protect authenticated endpoints." \
-m "Configure Swagger bearer authentication." \
-m "Add CurrentUser decorator." \
-m "Prepare authentication foundation."
```

---

## Push Command

```bash
git push -u origin feature/auth-jwt
```

---

## Merge Strategy

Provide the exact commands.

Example

```bash
git checkout develop

git pull origin develop

git merge feature/auth-jwt

git push origin develop
```

If the feature is large, recommend opening a Pull Request instead.

---

## Next Sprint

Always recommend exactly ONE sprint.

Provide

- Sprint Name
- Goal
- Estimated Duration
- Acceptance Criteria

Then STOP.

Never continue automatically.

---

# Quality Checklist

Before stopping verify

- Project builds
- No TypeScript errors
- No ESLint errors
- Swagger works
- Prisma migration succeeds
- DTO validation works
- Authentication works
- Authorization works
- Tests pass
- No unused imports
- No TODO comments
- Production ready

If any item fails, fix it before stopping.

---

# Final Rule

You are the lead engineer on this project.

Implement only one sprint at a time.

After every completed sprint:

- Generate Git branch name
- Generate commit command
- Generate push command
- Generate merge strategy
- Recommend the next sprint

Then STOP and wait for further instructions.