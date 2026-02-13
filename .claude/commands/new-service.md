Create a new service for the entity "$ARGUMENTS".

Follow the existing patterns in this project:
1. Create the type file at `src/core/types/<entity-name>.type.ts` (look at existing types for the pattern)
2. Create the service file at `src/core/services/<entity-name>.service.ts` (extend the base service pattern from supa/services)
3. Create any needed enumerations at `src/core/enumerations/<entity-name>-*.enum.ts`
4. Use kebab-case filenames with appropriate suffixes (.type.ts, .service.ts, .enum.ts)
5. Use PascalCase for the type/interface and class names
6. Use path aliases (@core/, @supa/) for imports

Before creating, check if a matching database table exists in /Users/mbaldwin/Curby/curby/supabase-backup/create_db.sql.
