{
  description = "Dev shell for csv-stream-lite";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };

        # Shared libraries the npm-downloaded Playwright browser binaries
        # need at runtime. nixpkgs' own `playwright-driver.browsers` isn't
        # used here because its bundled Chromium revision is pinned
        # independently of nixpkgs and regularly drifts out of sync with
        # whatever `playwright` version is in pnpm-lock.yaml (mismatched
        # revisions fail to launch). Providing just the missing libs lets
        # `pnpm exec playwright install` download browsers that already
        # match the project's pinned playwright version, and still run.
        playwrightLibs = pkgs.lib.makeLibraryPath [
          pkgs.glib
          pkgs.nspr
          pkgs.nss
          pkgs.atk
          pkgs.at-spi2-atk
          pkgs.at-spi2-core
          pkgs.dbus
          pkgs.libx11
          pkgs.libxcomposite
          pkgs.libxdamage
          pkgs.libxext
          pkgs.libxfixes
          pkgs.libxrandr
          pkgs.libxcb
          pkgs.mesa
          pkgs.libgbm
          pkgs.expat
          pkgs.libxkbcommon
          pkgs.systemd
          pkgs.alsa-lib
        ];
      in
      {
        # Node major version here should track the `node-version` used in
        # .github/workflows/test.yaml.
        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.nodejs_24
            pkgs.corepack_24
            pkgs.patchelf
          ];

          shellHook = ''
            export LD_LIBRARY_PATH="${playwrightLibs}:$LD_LIBRARY_PATH"

            # corepack reads package.json's "packageManager" field and shims
            # the exact pnpm version pinned there, so it stays in sync
            # without hardcoding a pnpm version in this flake.
            export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
            corepack enable --install-directory "$PWD/.corepack-bin" >/dev/null 2>&1
            export PATH="$PWD/.corepack-bin:$PATH"

            # Browsers `playwright install` downloads are generic-linux ELF
            # binaries whose interpreter path (e.g. /lib64/ld-linux-*.so.2)
            # doesn't exist on NixOS. Point them at Nix's own dynamic linker
            # instead -- the same patch nixpkgs' own playwright-driver
            # applies internally. Safe to re-run; skips already-patched
            # binaries.
            patch-playwright-browsers() {
              local interp
              interp="$(cat ${pkgs.stdenv.cc}/nix-support/dynamic-linker)"
              find "$HOME/.cache/ms-playwright" -maxdepth 3 -type f \
                \( -name "chrome" -o -name "chrome-headless-shell" \
                   -o -name "firefox" -o -name "MiniBrowser" \) \
                2>/dev/null | while read -r bin; do
                  current="$(patchelf --print-interpreter "$bin" 2>/dev/null || true)"
                  if [ "$current" != "$interp" ]; then
                    patchelf --set-interpreter "$interp" "$bin"
                  fi
              done
            }
            export -f patch-playwright-browsers
            patch-playwright-browsers
          '';
        };
      }
    );
}
