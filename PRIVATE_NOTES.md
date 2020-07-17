# Tests

To run rspec notes with the docker-setup I apparently need to run the following in the foodsoft container under `/src`:

```bash
# Set up DB initially:
bundle exec rake db:setup RAILS_ENV=test DATABASE_URL=mysql2://root:secret@mariadb/test?encoding=utf8

# Run tests:
DATABASE_CLEANER_ALLOW_REMOTE_DATABASE_URL=true bin/tests
```

As this wasn't obious to me: Verify that this is the way to go and probably enhance the docs.

# Import a DB from an SQL dump
First needed to change everything from `utf8mb4_unicode_520_ci` to `utf8_general_ci` (required for the current mariadb version) - then run:

```bash
docker exec -i foodsoft_mariadb_1 sh -c 'exec mysql -u root -psecret' < ./my.sql
```