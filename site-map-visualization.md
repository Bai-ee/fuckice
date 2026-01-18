                              +---------------------------+
                              | ICERR Active Incident UI  |
                              +---------------------------+
                                          |
                              +---------------------------+
                              | Global System States      |
                              | [Loading/Empty/Error]     |
                              | [Stale/Access-Limited]    |
                              +---------------------------+
                                          |
                              +---------------------------+
                              | Dashboard Shell (Frox)    |
                              | Header: Report/Contact CTA|
                              | Last Verified | Focus Mode |
                              | Sticky Mobile Bar         |
                              +---------------------------+
                                          |
                              +---------------------------+
                              | State Picker (Default)    |
                              | Remembers Last State      |
                              | State Badge {State}-Active|
                              +---------------------------+
                                          |
                      +-------------------+--------------------+
                      |                                        |
            +-------------------------+            +---------------------------+
            | Sidebar (State-First)   |------------| Active Canvas (Bento/Grid)|
            | State at Top when set   |            +---------------------------+
            | Recent Contacts (3-5)   |                          |
            | Preferred Method Memory |                          |
            | Settings (Modal/Page)   |                          |
            +-------------------------+                          |
      +----------+---------+-------+-------+                     |
      |          |         |       |       |                     |
      |          |         |       |       |         +---------------------------+
      |          |         |       |       +-------->| Immediate Contact Tier    |
      |          |         |       |                 | Primary/Escalation/       |
      |          |         |       |                 | After-Hours Cards         |
      |          |         |       |                 | Tap-to-Copy Call/Email    |
      |          |         |       |                 | Fallback Contact          |
      |          |         |       |                 +---------------------------+
      |          |         |       |                                |
      |          |         |       |                     +---------------------------+
      |          |         |       |                     | Supporting Context Tier   |
      |          |         |       |                     | Map (Contact on Hover)    |
      |          |         |       |                     | Status Chips (icon+color) |
      |          |         |       |                     +---------------------------+
      |          |         |       |                                |
      |          |         |       |                     +---------------------------+
      |          |         |       |                     | Historical Data Tier      |
      |          |         |       |                     | Active Reports Table      |
      |          |         |       |                     | Contact Shortcut per Row  |
      |          |         |       |                     +---------------------------+
      |          |         |       |                                |
      |          |         |       |                     +------------------+
      |          |         |       |                     | [Incident Detail]|
      |          |         |       |                     | "Who to call now?"|
      |          |         |       |                     +------------------+
      |          |         |       |                                |
      |          |         |       |                     +----------------------+
      |          |         |       |                     | [Raw Snapshot View]  |
      |          |         |       |                     +----------------------+
      |          |         |       |
      |          |         |       +---------------->+---------------------------+
      |          |         |                        | State View (Map+List)     |
      |          |         |                        | Scoped {State}-Active     |
      |          |         |                        | Contacts above the fold    |
      |          |         |                        +---------------------------+
      |          |         |
      |          |         +---------------->+---------------------------+
      |          |                          | Agencies & Contacts       |
      |          |                          | Contact Cards | Verified  |
      |          |                          | Fallback Contact          |
      |          |                          | Recent Contacts block     |
      |          |                          +---------------------------+
      |          |                                       |
      |          |                           +------------------+
      |          |                           | [Source Detail]  |
      |          |                           +------------------+
      |          |
      |          +---------------->+---------------------------+
      |                             | Data Library (Bento)      |
      |                             | Downloads                 |
      |                             | Manual Refresh Flow       |
      |                             | Validation/Success/Fail   |
      |                             +---------------------------+
      |
      +---------------->+---------------------------+
                            | Settings (Modal/Page)   |
                            | Preferences/Filters     |
                            | Remember State/Contact  |
                            | Preferred Contact Method|
                            +---------------------------+
