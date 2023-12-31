### SocialNation

Frontend hosted at -> https://social-nation.vercel.app/
<br>
Backend hosted at -> https://socialnation-server.onrender.com/


#### To Do
- [ ] Dockerize Application and setup pipeline
  ```
    ├── .github/
    │   └── workflows/
    │       └── pipeline.yml

  secrets to be added to settings/secrets/actions
  ```
  ```

  name: Build and Deploy

  # Run the workflow when code is pushed to the main branch
  on:
    push:
      branches:
        - main
  
  # Set environment variables
  env:
    MONGODB_URI: ${{ secrets.MONGODB_URI }}
    TOKEN_KEY: ${{ secrets.TOKEN_KEY }}
    EMAIL: ${{ secrets.EMAIL }}
    PASSWORD: ${{ secrets.PASSWORD }}
  
  # This is the workflow that is being run.
  jobs:
    build-and-deploy:
      # This is telling GitHub to run the workflow on the latest version of Ubuntu.
      runs-on: ubuntu-latest
      steps:
        # Checkout the code from the GitHub repository
        - name: Checkout code
          uses: actions/checkout@v2
  
        # Install dependencies and run tests for the client application
        - name: Install and Test Client
          working-directory: ./client
          run: |
            npm install
            npm run test
  
        # Install dependencies, export environment variables to be used by application and run tests for the server application
        - name: Install and Test Server
          working-directory: ./server
          run: |
            npm install
            export MONGODB_URI=$MONGODB_URI
            export TOKEN_KEY=$TOKEN_KEY
            export EMAIL=$EMAIL
            export PASSWORD=$PASSWORD
            npm run test
  
        # Build a Docker image for the client application
        - name: Build Client Docker Image
          working-directory: ./client
          # Build image with tag rakeshpotnuru/productivity-app:client
          run: |
            docker build -t rakeshpotnuru/productivity-app:client-${{github.run_number}} .
  
        # Build a Docker image for the server application
        - name: Build Server Docker Image
          working-directory:
            ./server
            # Build image with tag rakeshpotnuru/productivity-app:server
          run: |
            docker build -t rakeshpotnuru/productivity-app:server-${{github.run_number}} .
  
        # Login to Docker Hub using credentials from repository secrets
        - name: Login to Docker Hub
          uses: docker/login-action@v1
          with:
            username: ${{ secrets.DOCKER_USERNAME }}
            password: ${{ secrets.DOCKER_PASSWORD }}
  
        # Push the Docker images to Docker Hub
        - name: Push Docker Images to Docker Hub
          run: |
            docker push rakeshpotnuru/productivity-app:client-${{github.run_number}}
            docker push rakeshpotnuru/productivity-app:server-${{github.run_number}}
  ```
