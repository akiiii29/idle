import { prisma } from "./prisma";

/**
 * Checks and performs automatic fusion for a specific pet type.
 * When 3 pets of the same Name and upgradeLevel exist, they merge into +1.
 * Recursive: 3x (+1) -> 1x (+2).
 */
export async function autoFuseBeasts(userId: string, petName: string, level: number, tx: any = prisma) {
    // Find all pets of this name and upgrade level
    const candidates = await tx.beast.findMany({
        where: {
            ownerId: userId,
            name: petName,
            upgradeLevel: level
        },
        orderBy: { capturedAt: "asc" }
    });

    if (candidates.length >= 3) {
        // We have a triplet!
        const [targetPet, ...others] = candidates.slice(0, 3);
        const toDeleteIds = others.map((p: any) => p.id);

        // Delete the 2 extras
        await tx.beast.deleteMany({
            where: { id: { in: toDeleteIds } }
        });

        // Upgrade the target
        const nextLevel = level + 1;
        await tx.beast.update({
            where: { id: targetPet.id },
            data: {
                upgradeLevel: nextLevel,
                // Add a small power spike for fusion
                power: { increment: Math.floor(targetPet.power * 0.15) + 5 }
            }
        });

        // RECURSIVE: Check if we now have 3 of the next level
        return autoFuseBeasts(userId, petName, nextLevel, tx);
    }
}
