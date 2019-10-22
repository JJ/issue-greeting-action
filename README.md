# Greeting for first pull request

Greets pull requests, using metadata such as user name. Forked from [`actions/first interaction`](https://github.com/actions/first-interaction)

# Usage

See [action.yml](action.yml)

```yaml
steps:
- uses: actions/first-interaction@v1
  with:
    repo-token: ${{ secrets.GITHUB_TOKEN }}
    issue-message: '# Message with markdown.\nThis is the message that will be displayed on users' first issue.'
    pr-message: 'Message that will be displayed on users' first pr. Look, a `code block` for markdown.'
```

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
