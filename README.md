# (GitHub-Flavored) Markdown Editor

Directory Structure (outside of Boilerplate):

 * /api_providers : includes files that define interface definitions for API as well as a concrete implementation.
 * /utils : contains timeout handlers used for pretty rudimentary retry logic on api timeout.
 * Of note in / : TimeSeriesDisplayComponents contains definitions for stateless components used in TimeSeriesDisplay, which maintains state for managing paging and fetching data from given apiProvider.

TO-DO: Add unit tests.

To run.

1) Install dependencies : `npm install`
2) Run : `npm run start`
