import { ActivityEntity } from "@/types/activities";
import { MemberEntity } from "@/types/members";

export interface ActivityEntityWithMembers
  extends Omit<ActivityEntity, "owner"> {
  owner: MemberEntity[];
}

export function mapOwnersToMembers(
	activities: ActivityEntity[],
	members: MemberEntity[],
): ActivityEntityWithMembers[] {
	return activities.map((activity) => {
		const memberOwners: MemberEntity[] = (activity.owner || [])
			.map((ownerId) => {
				return members.find((member) => member.id === ownerId);
			})
			.filter((member): member is MemberEntity => member !== undefined);

		return {
			...activity,
			owner: memberOwners,
		};
	});
}
