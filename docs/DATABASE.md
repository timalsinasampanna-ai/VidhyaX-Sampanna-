# Vidhya X — Database Architecture Specification

## Overview
Vidhya X is powered exclusively by **Supabase PostgreSQL** with comprehensive Row Level Security (RLS) policies, foreign key integrity, server-enforced package pricing, and audit logging.

---

## 1. Schema Tables & Relationships

### `public.profiles`
Associated 1-to-1 with Supabase `auth.users(id)`.
- `id` (UUID, PK, FK to `auth.users`)
- `email` (TEXT, UNIQUE)
- `full_name` (TEXT)
- `phone_number` (TEXT, Nepal format validation)
- `role` (TEXT: `'student'` | `'admin'`)
- `grade` (TEXT: `'11'` | `'12'` | `'both'`)
- `college_name` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### `public.classes`
Represents Grade 11 and Grade 12 educational packages.
- `id` (TEXT, PK: `'11'`, `'12'`)
- `name` (TEXT)
- `grade_number` (INT: `11`, `12`)
- `description` (TEXT)
- `price_npr` (INT: `599`)
- `is_active` (BOOLEAN)
- `sort_order` (INT)

### `public.subjects`
16 distinct NEB curriculum subjects across Grade 11 and Grade 12.
- `id` (TEXT, PK, e.g. `'phy-11'`, `'chem-12'`)
- `class_id` (TEXT, FK to `classes.id`)
- `name` (TEXT: Physics, Chemistry, Botany, Zoology, Basic Mathematics, Computer Science, English, Nepali)
- `code` (TEXT, e.g. `'PHY-11'`)
- `chapter_count` (INT)

### `public.chapters`
Individual syllabus chapters.
- `id` (TEXT, PK)
- `subject_id` (TEXT, FK to `subjects.id`)
- `class_id` (TEXT, FK to `classes.id`)
- `title` (TEXT)
- `chapter_number` (INT)
- `material_count` (INT)

### `public.study_materials`
Metadata for uploaded study PDF documents.
- `id` (UUID, PK)
- `title` (TEXT)
- `description` (TEXT)
- `class_id`, `subject_id`, `chapter_id`
- `category` (TEXT: `'Notes'`, `'PYQ'`, `'Solutions'`, `'Practice Questions'`, `'Other Study Materials'`)
- `is_premium` (BOOLEAN)
- `file_url` (TEXT: Supabase Storage path)
- `file_size_bytes` (BIGINT)
- `page_count` (INT)
- `download_count` (INT)
- `published` (BOOLEAN)

### `public.purchases`
Payment requests and transactions submitted via eSewa.
- `id` (UUID, PK)
- `user_id` (UUID, FK to `auth.users`)
- `student_name`, `student_email`
- `package_id` (`'class-11-full'`, `'class-12-full'`)
- `class_grade` (INT: `11`, `12`)
- `amount_npr` (INT: Fixed `599`, enforced by DB constraint)
- `payment_method` (`'esewa'`, `'khalti'`, `'bank_transfer'`)
- `transaction_reference` (TEXT)
- `payer_phone_number` (TEXT)
- `proof_file_path` (TEXT: Private Storage bucket path)
- `status` (`'pending_approval'`, `'approved'`, `'rejected'`)
- `admin_note` (TEXT)
- `reviewed_by` (TEXT), `reviewed_at` (TIMESTAMPTZ)

### `public.admin_audit_logs`
Immutable audit log tracking administrator decisions.
- `id` (UUID, PK)
- `admin_id` (UUID, FK to `auth.users`)
- `admin_email` (TEXT)
- `action` (TEXT: `'APPROVE_PURCHASE'`, `'REJECT_PURCHASE'`, etc.)
- `target_entity` (TEXT)
- `entity_id` (TEXT)
- `details` (TEXT)
- `timestamp` (TIMESTAMPTZ)
