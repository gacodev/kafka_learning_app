# Kafka Study Assistant - Spaced Repetition System

## Overview
A simple yet effective spaced repetition learning system built with Next.js to help users prepare for Apache Kafka certifications (CCDAK and Kafka Administrator). The application uses local storage and JSON files to manage study materials and track progress.

## Features
- Spaced repetition algorithm for optimal learning retention
- Comprehensive question bank for CCDAK and Kafka Administrator certifications
- Progress tracking with local storage
- Simple and intuitive interface
- Offline-capable study sessions

## Technical Stack
- Next.js 14
- TypeScript
- TailwindCSS
- Local Storage for progress tracking
- JSON data storage for questions and answers

## Topics Covered
### CCDAK (Confluent Certified Developer for Apache Kafka)
- Kafka Architecture
- Kafka Producer API
- Kafka Consumer API
- Basic Operations
- Configuration and Security
- Data Formats

### Kafka Administrator
- Cluster Installation and Configuration
- Broker Management
- Topic Management
- Security Implementation
- Performance Tuning
- Monitoring and Troubleshooting

## Prerequisites
- Node.js 18.17 or later

## Installation
1. Clone the repository
2. Run `npm install` to install the dependencies
3. Run `npm run dev` to start the development server

## Progress Tracking
User progress is stored in the browser's local storage, tracking:
- Last review date for each question
- Success rate
- Next review date based on the spaced repetition algorithm
- Overall progress per certification track

## Usage
1. Select your certification track (CCDAK or Kafka Administrator)
2. Complete the initial assessment
3. Follow the daily study schedule
4. Review topics according to the spaced repetition algorithm
5. Track your progress through the dashboard

## Contributing
Contributions are welcome! Feel free to:
- Add new questions
- Improve existing answers
- Fix errors or typos
- Enhance the UI/UX

Please submit a Pull Request with your changes.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Support
For support, please open an issue in the GitHub repository or contact [gabriel.contrerasv3@gmail.com]

## Acknowledgments
- SuperMemo algorithm for spaced repetition
- Apache Kafka community
- Confluent documentation and learning resources
