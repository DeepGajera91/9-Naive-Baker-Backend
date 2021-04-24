# 9-Naive-Baker

## IT314 - Group 9

#### Mentor: Prof. Saurabh Tiwari

#### Project: Naive-Baker

This repo contains Naive-Baker Backend code. There are total of 2 repositories.

-   Frontend Repository : [https://github.com/Jitu-U/9-Naive-Baker/](https://github.com/Jitu-U/9-Naive-Baker)
-   Backend Repository (This repo): [https://github.com/DeepGajera91/9-Naive-Baker-Backend/](https://github.com/DeepGajera91/9-Naive-Baker-Backend)


## Development
- Fork and Clone the local repository.
```bash
git clone <your-url>
```
- Add your local repository as origin
```bash
git remote add origin <your-url>
```

- Add this repository as upstream
```bash
git remote add upstream https://github.com/DeepGajera91/9-Naive-Baker-Backend.git
```

- To sync your local repository with central repository
```bash
git pull upstream main
```

- You need Node & Yarn to start the development environment. Download them here - [Node](https://nodejs.org/), [Yarn](https://yarnpkg.com).

- You can setup a `.env` file in the root of the repository. The file should look like this:

```bash
PORT=<PORT number>
MONGO_URI=<ADD YOUR MONGODB CLUSTER URI>
TOKEN_SECRET=<ADD YOUR JWT SECRET KEY>
NODE_ENV=<Development Environment>
```

- Run the development server using:

```bash
npm install
npm start
```

- For production build:

```bash
npm build
```

## Contribution
-Create new branch and name it on the issue/feature you are working.

- to create new branch
```bash
git checkout -b <branch-name>
```
- to shift from one branch to another
```bash
git cheackout <branch-name>
```

- After completing create PR on that branch
```bash
git push origin <branch-name>
```
- Then from your local repo you can create pull request to upsream(central repository) 
