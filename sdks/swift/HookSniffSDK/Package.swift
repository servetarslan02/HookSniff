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
    dependencies: [
        .package(url: "https://github.com/apple/swift-crypto.git", from: "3.0.0"),
    ],
    targets: [
        .target(
            name: "HookSniff",
            dependencies: [
                .product(name: "Crypto", package: "swift-crypto"),
            ],
            path: "Sources/HookSniff"
        ),
        .testTarget(
            name: "HookSniffTests",
            dependencies: [
                "HookSniff",
                .product(name: "Crypto", package: "swift-crypto"),
            ],
            path: "Tests/HookSniffTests"
        ),
    ]
)
