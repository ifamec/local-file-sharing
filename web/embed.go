package web

import "embed"

//go:embed public
var StaticFiles embed.FS
