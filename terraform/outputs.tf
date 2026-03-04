output "public_ip" {
  description = "Elastic IP of the construction server"
  value       = aws_eip.construction.public_ip
}

output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.construction.id
}

output "ssh_command" {
  description = "SSH command to connect"
  value       = "ssh -i ~/Downloads/construction-key.pem ec2-user@${aws_eip.construction.public_ip}"
}

output "dns_instruction" {
  description = "Add this IP to GoDaddy DNS as A record for construction.bugzera.shop"
  value       = "GoDaddy DNS → construction A record → ${aws_eip.construction.public_ip}"
}
