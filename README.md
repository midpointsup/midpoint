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

### Deployment
- Deployed on VM using **Docker** and **Docker Compose**
- Accessible to the general public
- Deploy to GitHub Pages or similar

### Third-Party API Interaction
- **Mapbox** and **Google Maps Platform**

### Authentication
- Use **OAuth 2.0** for user authentication and data modification

## Additional Requirements

- **Real-Time Features:**
  - Live changing routes
  - Live cursor tracking and following (like Figma)

- **Long-Running Task:**
  - Generating the midpoint based on average distance, user input, and ratings

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

### Our Documents
- [Figma](https://www.figma.com/design/hCrCt9lviPd83UQcCELCH7/Midpoint?node-id=0-1&t=X58tu3tPYz5Yr6Sy-1)

## Our Team: Spiders
- Catherine Sun | [cat.sun@mail.utoronto.ca](mailto:cat.sun@mail.utoronto.ca)
- Madison Majarais | [madison.majarais@mail.utoronto.ca](mailto:madison.majarais@mail.utoronto.ca)
- Rachel Kwan | [rachelhoyan.kwan@mail.utoronto.ca](mailto:rachelhoyan.kwan@mail.utoronto.ca)
