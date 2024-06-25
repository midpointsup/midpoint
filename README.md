# Midpoint

Midpoint is a web application designed to help users find convenient meeting locations. Key features include:

### Main Features

- **Meet in the Middle:** Finds meeting points based on average distance between users and API reviews.
- **Recommendations:** Suggests preferred stores (e.g., restrooms, parks, movies, malls, restaurants - healthy, Japanese, American).
- **Multiple Stops:** Users can add multiple stops where others can join.
- **Group Routes:** All users in the same group can view shared routes.
- **Explore Map:** Real-time map exploration and live route changes.
- **Real-Time Interaction:** Follow other users' cursors and see live ratings for pinned places.
- **User Profiles:** Show calendar availability, send email invites, import/export Google Calendar, and automatically add plans to calendars.
- **Invite Friends**: Send emails to invite new users to join a plan using SendGrid API.

### Other Features

- **Authentication:** User login and group creation.
- **Group Profiles:** Manage group information and interactions.
- **Extras:** Live annotation, traffic map, sentiment analysis on ratings, and user permissions (admin, editor, viewer, etc.).

## Required Elements

### Frontend

- Use a modern frontend framework: **Vue**

### RESTful API

- CRUD Operations:
  - Add, get, delete users
  - Add, get, delete groups
  - Add, get, delete pinned stores
  - Add, get, delete calendar events

### Database

- **PostgreSQL**: Supports complex queries for managing users, plans, roles, permissions, trips, checkpoints, ratings, and locations effectively.

### Deployment

- Deployed on VM using **Docker** and **Docker Compose**
- Accessible to the general public
- Deploy to GitHub Pages or similar

### Third-Party API Interaction

- **Mapbox**, **Google Maps Platform** and **SendGrid**

### Authentication

- Use **OAuth 2.0** for user authentication and data modification

## Additional Requirements

- **Real-Time Features:**

  - Live changing routes
  - Live cursor tracking and following (like Figma)

- **Long-Running Task:**

  - Generating the midpoint based on average distance, user input, and ratings. Due to the complexity of processing user input, fetching and analyzing ratings with sentiment analysis, and computing an optimal midpoint, this operation may take 10+ seconds.

- **Webhook Integration:**
  - Users can view sent/read status on outgoing emails using SendGrid's webhooks.

## Milestones

### Alpha Version

- Setup & Learn Vue
- Setup Vue with Mapbox & Google APIs
- Implement map exploration (moving around the map)
- Design UI in Figma
- Develop main pages' UI layout
- Implement "Meet in the Middle" form
- Setup group views and user profile/settings
- Backend: Start API with CRUD operations
- Docker setup

### Beta Version

- Implement user authentication
- Group creation feature
- Overlay and filter routes
- Complete "Meet in the Middle" algorithm
- Complete real-time features:
  - Live changing routes
  - Live cursor tracking
- Finalize user profile settings
- Setup invite emails using SendGrid API

### Final Version

- Enhance and clean up existing features
- Add extra features: multiple stops, calendar, pinned restaurants
- Prepare presentation

## Resources

### Mapbox

- [Setup](https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-vue/)
- [Directions API](https://docs.mapbox.com/help/tutorials/getting-started-directions-api/)
- [Route Optimization](https://docs.mapbox.com/help/tutorials/optimization-api/)
- [Grabbing Store Data](https://docs.mapbox.com/help/tutorials/geocode-and-sort-stores/)

### Google Maps API

- [API Picker](https://developers.google.com/maps/documentation/api-picker?_gl=1*baor44*_up*MQ..*_ga*MTI5NzI2NzE3OS4xNzE3NDUwMzc5*_ga_NRWSTWS78N*MTcxNzQ1MDM3OC4xLjAuMTcxNzQ1MDM3OC4wLjAuMA..)

### Additional Resources

- [Bootstrap](https://getbootstrap.com/)
- [Sendgrid API](https://www.twilio.com/docs/sendgrid/for-developers/sending-email/api-getting-started)

### Our Documents

- [Figma](https://www.figma.com/design/hCrCt9lviPd83UQcCELCH7/Midpoint?node-id=0-1&t=X58tu3tPYz5Yr6Sy-1)
- [JIRA](https://project-spiders.atlassian.net/jira/software/projects/SPI/boards/1)

## Our Team: Spiders

|                                                                                                                                                                                                           |                                                                                                                                                                                                                                   |                                                                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="https://avatars.githubusercontent.com/u/59343226?s=88&amp;v=4" width="44" height="44" alt="@catherine-sun"> <br> Catherine Sun <br> [cat.sun@mail.utoronto.ca](mailto:cat.sun@mail.utoronto.ca) | <img src="https://avatars.githubusercontent.com/u/100644292?s=88&amp;v=4" width="44" height="44" alt="@MadisonMajarais"> <br> Madison Majarais <br> [madison.majarais@mail.utoronto.ca](mailto:madison.majarais@mail.utoronto.ca) | <img src="https://avatars.githubusercontent.com/u/57234754?s=88&amp;v=4" width="44" height="44" alt="@rkwan05"> <br> Rachel Kwan <br> [rachelhoyan.kwan@mail.utoronto.ca](mailto:rachelhoyan.kwan@mail.utoronto.ca) |
