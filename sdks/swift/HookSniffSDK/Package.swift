// swift-tools-version:5.7

import PackageDescription

let package = Package(
    name: "HookSniff",
    platforms: [
        .iOS(.v13),
        .macOS(.v10_15),
        .tvOS(.v13),
        .watchOS(.v6),
    ],
    products: [
        .library(
            name: "HookSniff",
            targets: ["HookSniff"]
        ),
    ],
    dependencies: [],
    targets: [
        .target(
            name: "HookSniff",
            dependencies: [],
            path: "Sources/HookSniff"
        ),
        .testTarget(
            name: "HookSniffTests",
            dependencies: ["HookSniff"],
            path: "Tests/HookSniffTests"
        ),
    ]
)
