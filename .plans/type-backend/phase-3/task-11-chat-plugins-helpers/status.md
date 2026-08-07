# Status: Chat Plugin & Helper Types

**Current Status**: complete
**Last Updated**: 2026-08-07
**Agent**: Claude (claude-sonnet-4-6)
**Branch**: plan/type-backend/phase-3
**PR**: —

## Status History

| Timestamp | Status | Agent | Notes |
|-----------|--------|-------|-------|
| 2026-05-31 | not-started | — | Task created |
| 2026-08-07 | complete | Claude | IChatPlugin interface defined; all 5 plugins + helpers typed |

## Artifacts

- `IChatPlugin` interface exported from `src/app/plugins/chats/Base.ts`
- `ChatsBase`: `licensee: ILicensee`, repos typed as `IRepository<T>`, local `ITriggerRepository`
- `factory.ts`: typed `licensee: ILicensee`, `inbox: IInbox | null`, returns `IChatPlugin`
- All 5 chat plugins (Rocketchat, Crisp, Cuboup, Chatwoot, LocalChat): constructor and `sendMessage` typed
- `src/app/helpers/ParseTriggerText.ts`: `contact: any` → `IContact`
- `src/app/helpers/Emoji.ts`: `rocketEmojis: any[]` → `string[]`

## Adaptations

- `LocalChat.sendMessage(messageId: string)` — no url param; IChatPlugin makes url optional
- `_roomRepository: IRepository<any>` — room type not yet defined in types/index.ts, kept as IRepository<any>
- LocalChat `_roomRepository` has custom `findOpenForContact` method not in IRepository; called directly, not through getter
- All chat plugin constructors keep `[key: string]: unknown` for pass-through deps

## Blockers

None
