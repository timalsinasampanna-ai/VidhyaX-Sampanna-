# Vidhya X — Security & Authorization Architecture

## 1. Zero-Trust Access Control (PostgreSQL RLS)
Every table containing student data or intellectual property is protected with Row Level Security (RLS) policies:
1. **Student Profiles**: Students can view and update their own name, phone number, and college. The `role` field is strictly immutable by students; any attempt to escalate privilege to `admin` is rejected by policy `WITH CHECK`.
2. **Premium PDF Documents**: The `study_materials` table policy validates that non-admin requests must match an approved record in `purchases` (`status = 'approved' AND class_grade = class_id`).
3. **Purchases**: Students can only `INSERT` records where `amount_npr = 599` and `status = 'pending_approval'`. They cannot modify or approve their own purchase records.
4. **Online Tests**: Correct answer indices (`correct_option_index`) are evaluated server-side via Supabase Edge Function `test-scoring` or server RPC to prevent exam answers from leaking into browser developer tools prior to submission.
5. **Private Storage Buckets**:
   - `premium-materials`: Private bucket. Files are accessed only through short-lived (1-hour) signed URLs generated after entitlement verification.
   - `payment-proofs`: Private bucket. Accessible only by the purchasing student and verified administrators.
   - `free-materials`: Public bucket with read-only access for published materials.

---

## 2. Administrator Provisioning
- **Initial Administrator**: `officialsampannatimalsina@gmail.com` (Sampanna Timalsina)
- Admin privileges are governed by Supabase `app_metadata` and the `public.user_roles` table.
- Client applications never possess the `service-role` key. All privileged administrative operations (approval, role mutation) execute inside isolated Supabase Edge Functions with cryptographically verified JWT bearer tokens.

---

## 3. Payment Verification Integrity
- The system enforces a human review queue (5–6 hours timeline) with full audit logging in `admin_audit_logs`.
- Package amounts are locked at NPR 599 on the database level; client-submitted amounts are never trusted.
