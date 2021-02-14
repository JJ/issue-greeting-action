# Greeting for first pull request

Greets pull requests, using metadata such as user name. Forked from [`actions/first interaction`](https://github.com/actions/first-interaction)

# Usage

Here is an example that you could put in .github/workflows/pr-greeting.yaml

```yaml
name: "PR Greeter"
on: [pull_request]

jobs:
  pr-greeter:
    runs-on: ubuntu-latest
    steps:
      - name: "Greeter"
        uses: JJ/pr-greeting-action@releases/v1
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          greeting: "Hey **#** welcome to this repo"
```

This action will check if it's the first pull request to the repo and
greet them; if you use the hash sign inside the message, it will get
substituted by the login name of the person doing the PR.

![Greeting JJ for his first PR](img/example.png)


# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
