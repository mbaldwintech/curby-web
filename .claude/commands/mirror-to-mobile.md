Check what shared code (types, enumerations, services) needs to be mirrored to the curby mobile repo.

Compare the specified files or entity "$ARGUMENTS" between:
- Web: /Users/mbaldwin/Curby/curby-web/src/core/ (types/, enumerations/, services/)
- Mobile: /Users/mbaldwin/Curby/curby/src/core/ (types/, enumerations/, services/)

Report any differences in:
1. Type definitions that exist in one repo but not the other
2. Enum values that are out of sync
3. Service methods that differ between repos

If no specific entity is provided, do a broad comparison of all type and enum files.

Do NOT make changes — just report the differences and ask the user which ones to sync.
