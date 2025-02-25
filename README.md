# DataToChart

（AI-powered）
DataToChart is a web-based application that helps users visualize their data through various chart types. It provides an intuitive interface for data input and offers both automated chart recommendations and manual chart selection options.

## Features

### 1. Interactive Data Table
- Editable table with dynamic columns (up to 10)
- Double-click to edit any cell
- Add or remove columns as needed
- Easy data input and modification
- Automatic cell height adjustment
- Visual feedback for editable cells

### 2. Chart Visualization

#### Automated Chart Recommendation
The "Recommend a Chart" feature automatically:
- Analyzes your data types (numeric, categorical, date)
- Determines the most suitable chart type based on data patterns
- Generates a visualization based on your data patterns
- Provides appropriate axis labels and titles

#### Manual Chart Selection
Available chart types include:
- Line Chart: For trending data over time
- Bar Chart: For comparing categories
- Scatter Plot: For showing relationships between variables
- Pie Chart: For showing proportions
- Histogram: For displaying data distribution
- Box Plot: For showing data distribution and outliers

### 3. Python Code Generation
- Automatically generates corresponding Python code using popular libraries:
  - Pandas
  - Matplotlib
  - Seaborn
- One-click code copying feature
- Ready-to-use code snippets
- Syntax highlighting for better readability

### 4. Advanced Analytics Features
- User Growth Analysis
- User Retention Analysis
- User Behavior Analysis
- Survey Analysis

## Changelog

### Version 1.0.0 (Initial Release)
- Basic data input through paste functionality
- Interactive data table with editing capabilities
- Basic chart types (line, bar, scatter, pie)
- Simple Python code generation

### Version 1.1.0
- Added automated chart recommendation system
- Implemented data type detection
- Enhanced Python code generation with more libraries

### Version 1.2.0
- Added color theme customization
- Introduced chart annotations feature
- Enhanced table editing capabilities
- Improved data validation

### Version 1.3.0
- Added comprehensive analytics features:
  - User Growth Analysis tools
  - Retention Analysis capabilities
  - Behavior Analysis features
  - Survey Analysis tools
- Enhanced data processing capabilities
- Improved chart customization options

### Version 1.4.0 (Latest)
- Added multiple color palettes:
  - Colorblind friendly
  - Vibrant theme
  - Soft pastel
  - Dark theme
- Enhanced annotation system with:
  - Vertical line annotations
  - Text annotations
  - Annotation management interface
- Improved data parsing with multiple format support
- Added demo datasets
- Enhanced UI/UX with better feedback and interactions

## User Interface

### Header Section
- Clean, modern navigation bar
- Responsive menu items
- Professional color scheme

### Main Content Area
- Organized in clear sections
- Intuitive button placement
- Visual feedback on user interactions

### Table Features
- Responsive design that works on all screen sizes
- Horizontal scrolling for many columns
- Clear cell borders and spacing
- Alternating row colors for better readability
- Hover effects on editable cells

### Chart Controls
- Clearly labeled buttons with icons
- Visual feedback on hover and click
- Disabled state styling for invalid operations
- Counter showing current column count

## Styling Details

### Color Scheme
- Primary colors:
  - Header/Footer: #333 (dark gray)
  - Buttons: Various themed colors
    - Add/Remove: #4CAF50 (green)
    - Recommend: #9C27B0 (purple)
    - Pick Chart: #FF5722 (orange)
- Text colors:
  - Headers: #333
  - Regular text: #666
  - Button text: white

### Typography
- Font family: Arial, sans-serif
- Line height: 1.6
- Responsive text sizing

### Visual Elements
- Rounded corners (8px radius)
- Subtle shadows for depth
- Smooth transitions on interactions
- Icon integration with Font Awesome

## Technical Details

### Built With
- HTML5
- CSS3
- Vanilla JavaScript
- Chart.js for visualizations
- Font Awesome for icons

### File Structure
- `index.html`: Main application page
- `resources.html`: Documentation and resources
- `script.js`: Core JavaScript functionality
- `styles.css`: Styling definitions
- `.github/workflows/static.yml`: GitHub Pages deployment configuration

## Future Enhancements
- Add more advanced statistical analysis features
- Implement data export functionality
- Add more chart types and customization options
- Enhance mobile responsiveness
- Add user authentication and data saving capabilities
- Implement real-time collaboration features

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
© 2025 DataToChart. All rights reserved.

## Development Log

### Latest Updates
- Added data paste functionality with example format in script.js
- Implemented table cell editing with double-click feature
- Added column management (add/remove) with 10 column limit
- Implemented dynamic button state management
- Added visual feedback for editable cells

### Upcoming Tasks
- Implement chart generation functionality
- Add data validation
- Implement chart recommendation system
- Add Python code generation feature 