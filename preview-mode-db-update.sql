```sql
-- Approved Users 테이블에 Preview 관련 컬럼 추가
ALTER TABLE approved_users 
ADD COLUMN is_preview BOOLEAN DEFAULT true,
ADD COLUMN usage_count INTEGER DEFAULT 0;

-- 기존 사용자들은 Preview가 아님(정식 사용자)로 설정 (선택 사항)
-- UPDATE approved_users SET is_preview = false WHERE email IN ('existing_admin@example.com');
```
