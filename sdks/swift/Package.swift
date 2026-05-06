// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "HookRelay",
    platforms: [
        .macOS(.v12),
        .iOS(.v15),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(name: "HookRelay", targets: ["HookRelay"])
    ],
    targets: [
        .target(
            name: "HookRelay",
            dependencies: []
        ),
        .testTarget(
            name: "HookRelayTests",
            dependencies: ["HookRelay"]
        )
    ]
)
