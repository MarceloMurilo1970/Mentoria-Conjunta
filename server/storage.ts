import { 
  type Registration, type InsertRegistration, registrations,
  type User, type InsertUser, users,
  type Company, type InsertCompany, companies,
  type Membership, type InsertMembership, memberships,
  type Invite, type InsertInvite, invites,
  type Meeting, type InsertMeeting, meetings,
  type AgendaItem, type InsertAgendaItem, agendaItems,
  type Attachment, type InsertAttachment, attachments,
  type Minutes, type InsertMinutes, minutes,
  type Task, type InsertTask, tasks,
  type TaskComment, type InsertTaskComment, taskComments,
  type MembershipWithUser, type MembershipWithCompany,
  type UserRole, type MinutesStatus, type TaskStatus
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or } from "drizzle-orm";

export interface IStorage {
  // Registrations (mentorship)
  getRegistration(id: string): Promise<Registration | undefined>;
  getRegistrationByEmail(email: string): Promise<Registration | undefined>;
  getAllRegistrations(): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  deleteRegistration(id: string): Promise<boolean>;
  updatePaymentReceived(id: string, received: boolean): Promise<Registration | undefined>;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Companies
  getCompany(id: string): Promise<Company | undefined>;
  getAllCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, data: Partial<Company>): Promise<Company | undefined>;
  deleteCompany(id: string): Promise<boolean>;

  // Memberships
  getMembership(id: string): Promise<Membership | undefined>;
  getMembershipsByUser(userId: string): Promise<MembershipWithCompany[]>;
  getMembershipsByCompany(companyId: string): Promise<MembershipWithUser[]>;
  getUserMembershipInCompany(userId: string, companyId: string): Promise<Membership | undefined>;
  createMembership(membership: InsertMembership): Promise<Membership>;
  updateMembership(id: string, role: UserRole): Promise<Membership | undefined>;
  deleteMembership(id: string): Promise<boolean>;

  // Invites
  getInvite(id: string): Promise<Invite | undefined>;
  getInviteByToken(token: string): Promise<Invite | undefined>;
  getInvitesByCompany(companyId: string): Promise<Invite[]>;
  createInvite(invite: InsertInvite & { token: string }): Promise<Invite>;
  acceptInvite(id: string): Promise<Invite | undefined>;
  deleteInvite(id: string): Promise<boolean>;

  // Meetings
  getMeeting(id: string): Promise<Meeting | undefined>;
  getMeetingsByCompany(companyId: string): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: string, data: Partial<Meeting>): Promise<Meeting | undefined>;
  deleteMeeting(id: string): Promise<boolean>;

  // Agenda Items
  getAgendaItem(id: string): Promise<AgendaItem | undefined>;
  getAgendaItemsByMeeting(meetingId: string): Promise<AgendaItem[]>;
  createAgendaItem(item: InsertAgendaItem): Promise<AgendaItem>;
  updateAgendaItem(id: string, data: Partial<AgendaItem>): Promise<AgendaItem | undefined>;
  deleteAgendaItem(id: string): Promise<boolean>;
  reorderAgendaItems(meetingId: string, itemIds: string[]): Promise<void>;

  // Attachments
  getAttachment(id: string): Promise<Attachment | undefined>;
  getAttachmentsByAgendaItem(agendaItemId: string): Promise<Attachment[]>;
  getAttachmentsByMeeting(meetingId: string): Promise<Attachment[]>;
  getAttachmentsByTask(taskId: string): Promise<Attachment[]>;
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  deleteAttachment(id: string): Promise<boolean>;

  // Minutes
  getMinutes(id: string): Promise<Minutes | undefined>;
  getMinutesByMeeting(meetingId: string): Promise<Minutes | undefined>;
  createMinutes(mins: InsertMinutes): Promise<Minutes>;
  updateMinutes(id: string, data: Partial<Minutes>): Promise<Minutes | undefined>;

  // Tasks
  getTask(id: string): Promise<Task | undefined>;
  getTasksByCompany(companyId: string): Promise<Task[]>;
  getTasksByAssignee(userId: string): Promise<Task[]>;
  getTasksByMeeting(meetingId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, data: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Task Comments
  getTaskComments(taskId: string): Promise<TaskComment[]>;
  createTaskComment(comment: InsertTaskComment): Promise<TaskComment>;
  deleteTaskComment(id: string): Promise<boolean>;
}

export class DbStorage implements IStorage {
  // ==================== REGISTRATIONS ====================
  async getRegistration(id: string): Promise<Registration | undefined> {
    const result = await db.select().from(registrations).where(eq(registrations.id, id)).limit(1);
    return result[0];
  }

  async getRegistrationByEmail(email: string): Promise<Registration | undefined> {
    const result = await db.select().from(registrations).where(eq(registrations.email, email)).limit(1);
    return result[0];
  }

  async getAllRegistrations(): Promise<Registration[]> {
    return await db.select().from(registrations).orderBy(desc(registrations.createdAt));
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const result = await db.insert(registrations).values(insertRegistration).returning();
    return result[0];
  }

  async deleteRegistration(id: string): Promise<boolean> {
    const result = await db.delete(registrations).where(eq(registrations.id, id)).returning();
    return result.length > 0;
  }

  async updatePaymentReceived(id: string, received: boolean): Promise<Registration | undefined> {
    const result = await db.update(registrations)
      .set({ paymentReceived: received })
      .where(eq(registrations.id, id))
      .returning();
    return result[0];
  }

  // ==================== USERS ====================
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  // ==================== COMPANIES ====================
  async getCompany(id: string): Promise<Company | undefined> {
    const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
    return result[0];
  }

  async getAllCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(desc(companies.createdAt));
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const result = await db.insert(companies).values(insertCompany).returning();
    return result[0];
  }

  async updateCompany(id: string, data: Partial<Company>): Promise<Company | undefined> {
    const result = await db.update(companies).set(data).where(eq(companies.id, id)).returning();
    return result[0];
  }

  async deleteCompany(id: string): Promise<boolean> {
    const result = await db.delete(companies).where(eq(companies.id, id)).returning();
    return result.length > 0;
  }

  // ==================== MEMBERSHIPS ====================
  async getMembership(id: string): Promise<Membership | undefined> {
    const result = await db.select().from(memberships).where(eq(memberships.id, id)).limit(1);
    return result[0];
  }

  async getMembershipsByUser(userId: string): Promise<MembershipWithCompany[]> {
    const result = await db.select({
      id: memberships.id,
      userId: memberships.userId,
      companyId: memberships.companyId,
      role: memberships.role,
      createdAt: memberships.createdAt,
      company: companies
    }).from(memberships)
      .innerJoin(companies, eq(memberships.companyId, companies.id))
      .where(eq(memberships.userId, userId));
    
    return result.map(r => ({
      id: r.id,
      userId: r.userId,
      companyId: r.companyId,
      role: r.role as UserRole,
      createdAt: r.createdAt,
      company: r.company
    }));
  }

  async getMembershipsByCompany(companyId: string): Promise<MembershipWithUser[]> {
    const result = await db.select({
      id: memberships.id,
      userId: memberships.userId,
      companyId: memberships.companyId,
      role: memberships.role,
      createdAt: memberships.createdAt,
      user: users
    }).from(memberships)
      .innerJoin(users, eq(memberships.userId, users.id))
      .where(eq(memberships.companyId, companyId));
    
    return result.map(r => ({
      id: r.id,
      userId: r.userId,
      companyId: r.companyId,
      role: r.role as UserRole,
      createdAt: r.createdAt,
      user: r.user
    }));
  }

  async getUserMembershipInCompany(userId: string, companyId: string): Promise<Membership | undefined> {
    const result = await db.select().from(memberships)
      .where(and(eq(memberships.userId, userId), eq(memberships.companyId, companyId)))
      .limit(1);
    return result[0];
  }

  async createMembership(insertMembership: InsertMembership): Promise<Membership> {
    const result = await db.insert(memberships).values(insertMembership).returning();
    return result[0];
  }

  async updateMembership(id: string, role: UserRole): Promise<Membership | undefined> {
    const result = await db.update(memberships).set({ role }).where(eq(memberships.id, id)).returning();
    return result[0];
  }

  async deleteMembership(id: string): Promise<boolean> {
    const result = await db.delete(memberships).where(eq(memberships.id, id)).returning();
    return result.length > 0;
  }

  // ==================== INVITES ====================
  async getInvite(id: string): Promise<Invite | undefined> {
    const result = await db.select().from(invites).where(eq(invites.id, id)).limit(1);
    return result[0];
  }

  async getInviteByToken(token: string): Promise<Invite | undefined> {
    const result = await db.select().from(invites).where(eq(invites.token, token)).limit(1);
    return result[0];
  }

  async getInvitesByCompany(companyId: string): Promise<Invite[]> {
    return await db.select().from(invites)
      .where(eq(invites.companyId, companyId))
      .orderBy(desc(invites.createdAt));
  }

  async createInvite(insertInvite: InsertInvite & { token: string }): Promise<Invite> {
    const result = await db.insert(invites).values(insertInvite).returning();
    return result[0];
  }

  async acceptInvite(id: string): Promise<Invite | undefined> {
    const result = await db.update(invites).set({ accepted: true }).where(eq(invites.id, id)).returning();
    return result[0];
  }

  async deleteInvite(id: string): Promise<boolean> {
    const result = await db.delete(invites).where(eq(invites.id, id)).returning();
    return result.length > 0;
  }

  // ==================== MEETINGS ====================
  async getMeeting(id: string): Promise<Meeting | undefined> {
    const result = await db.select().from(meetings).where(eq(meetings.id, id)).limit(1);
    return result[0];
  }

  async getMeetingsByCompany(companyId: string): Promise<Meeting[]> {
    return await db.select().from(meetings)
      .where(eq(meetings.companyId, companyId))
      .orderBy(desc(meetings.startAt));
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const result = await db.insert(meetings).values(insertMeeting).returning();
    return result[0];
  }

  async updateMeeting(id: string, data: Partial<Meeting>): Promise<Meeting | undefined> {
    const result = await db.update(meetings).set(data).where(eq(meetings.id, id)).returning();
    return result[0];
  }

  async deleteMeeting(id: string): Promise<boolean> {
    const result = await db.delete(meetings).where(eq(meetings.id, id)).returning();
    return result.length > 0;
  }

  // ==================== AGENDA ITEMS ====================
  async getAgendaItem(id: string): Promise<AgendaItem | undefined> {
    const result = await db.select().from(agendaItems).where(eq(agendaItems.id, id)).limit(1);
    return result[0];
  }

  async getAgendaItemsByMeeting(meetingId: string): Promise<AgendaItem[]> {
    return await db.select().from(agendaItems)
      .where(eq(agendaItems.meetingId, meetingId))
      .orderBy(agendaItems.orderNumber);
  }

  async createAgendaItem(insertItem: InsertAgendaItem): Promise<AgendaItem> {
    const result = await db.insert(agendaItems).values(insertItem).returning();
    return result[0];
  }

  async updateAgendaItem(id: string, data: Partial<AgendaItem>): Promise<AgendaItem | undefined> {
    const result = await db.update(agendaItems).set(data).where(eq(agendaItems.id, id)).returning();
    return result[0];
  }

  async deleteAgendaItem(id: string): Promise<boolean> {
    const result = await db.delete(agendaItems).where(eq(agendaItems.id, id)).returning();
    return result.length > 0;
  }

  async reorderAgendaItems(meetingId: string, itemIds: string[]): Promise<void> {
    for (let i = 0; i < itemIds.length; i++) {
      await db.update(agendaItems)
        .set({ orderNumber: i + 1 })
        .where(and(eq(agendaItems.id, itemIds[i]), eq(agendaItems.meetingId, meetingId)));
    }
  }

  // ==================== ATTACHMENTS ====================
  async getAttachment(id: string): Promise<Attachment | undefined> {
    const result = await db.select().from(attachments).where(eq(attachments.id, id)).limit(1);
    return result[0];
  }

  async getAttachmentsByAgendaItem(agendaItemId: string): Promise<Attachment[]> {
    return await db.select().from(attachments)
      .where(eq(attachments.agendaItemId, agendaItemId))
      .orderBy(desc(attachments.createdAt));
  }

  async getAttachmentsByMeeting(meetingId: string): Promise<Attachment[]> {
    return await db.select().from(attachments)
      .where(eq(attachments.meetingId, meetingId))
      .orderBy(desc(attachments.createdAt));
  }

  async getAttachmentsByTask(taskId: string): Promise<Attachment[]> {
    return await db.select().from(attachments)
      .where(eq(attachments.taskId, taskId))
      .orderBy(desc(attachments.createdAt));
  }

  async createAttachment(insertAttachment: InsertAttachment): Promise<Attachment> {
    const result = await db.insert(attachments).values(insertAttachment).returning();
    return result[0];
  }

  async deleteAttachment(id: string): Promise<boolean> {
    const result = await db.delete(attachments).where(eq(attachments.id, id)).returning();
    return result.length > 0;
  }

  // ==================== MINUTES ====================
  async getMinutes(id: string): Promise<Minutes | undefined> {
    const result = await db.select().from(minutes).where(eq(minutes.id, id)).limit(1);
    return result[0];
  }

  async getMinutesByMeeting(meetingId: string): Promise<Minutes | undefined> {
    const result = await db.select().from(minutes).where(eq(minutes.meetingId, meetingId)).limit(1);
    return result[0];
  }

  async createMinutes(insertMinutes: InsertMinutes): Promise<Minutes> {
    const result = await db.insert(minutes).values(insertMinutes).returning();
    return result[0];
  }

  async updateMinutes(id: string, data: Partial<Minutes>): Promise<Minutes | undefined> {
    const result = await db.update(minutes).set(data).where(eq(minutes.id, id)).returning();
    return result[0];
  }

  // ==================== TASKS ====================
  async getTask(id: string): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result[0];
  }

  async getTasksByCompany(companyId: string): Promise<Task[]> {
    return await db.select().from(tasks)
      .where(eq(tasks.companyId, companyId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksByAssignee(userId: string): Promise<Task[]> {
    return await db.select().from(tasks)
      .where(eq(tasks.assignedToUserId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksByMeeting(meetingId: string): Promise<Task[]> {
    return await db.select().from(tasks)
      .where(eq(tasks.meetingId, meetingId))
      .orderBy(desc(tasks.createdAt));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(insertTask).returning();
    return result[0];
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task | undefined> {
    const result = await db.update(tasks).set(data).where(eq(tasks.id, id)).returning();
    return result[0];
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result.length > 0;
  }

  // ==================== TASK COMMENTS ====================
  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    return await db.select().from(taskComments)
      .where(eq(taskComments.taskId, taskId))
      .orderBy(taskComments.createdAt);
  }

  async createTaskComment(insertComment: InsertTaskComment): Promise<TaskComment> {
    const result = await db.insert(taskComments).values(insertComment).returning();
    return result[0];
  }

  async deleteTaskComment(id: string): Promise<boolean> {
    const result = await db.delete(taskComments).where(eq(taskComments.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DbStorage();
