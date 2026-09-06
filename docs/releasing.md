# Preparing a release

1. Run `npm ci` and `npm run release:check` on a supported Node version.
2. Run the browser benchmark workloads and inspect the docs/playground in both
   themes. Record results in `docs/release-verification.md`.
3. Review the MIT copyright line and third-party notices. Confirm the selected
   npm name and GitHub owner/repository. Name availability is not a reservation.
4. Set real `repository`, `homepage` and `bugs` package fields when the destination
   exists. Add actual links to the README; do not invent hosted URLs.
5. Review `npm pack --dry-run`. The tarball must contain compiled code/types,
   stylesheet/fonts, README and licences, without source secrets or test artifacts.
6. Create/push the public GitHub repository when you choose. Enable private
   vulnerability reporting. Observe CI on the pushed revision.
7. Optionally run the manual Pages workflow after enabling Pages with Actions.
8. Publish the reviewed tarball to npm when ready, then replace the local tarball
   installation example with the verified registry command.

The source is not automatically published or deployed by local checks. CI is
configured locally; only an actual remote run can prove GitHub CI has passed.
